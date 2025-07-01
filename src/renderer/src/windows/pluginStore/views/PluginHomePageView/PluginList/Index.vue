<template>
    <div class="plugin-list-container">
        <div class="aside">
            <Aside></Aside>
        </div>
        <div class="plugin-page">
            <div class="plugin-grid">
                <PluginCard v-for="plugin in plugins" :key="plugin.id + plugin.version" :plugin="plugin">
                </PluginCard>
            </div>
            <div class="pagination">
                <el-pagination v-model:current-page="pagination.curretPage" layout="prev, pager, next"
                    hide-on-single-page :page-count="pagination.totalPages" :pager-count="11"
                    @current-change="handleCurrentChange" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import PluginCard from "../PluginCard/Index.vue";
import Aside from "./Aside/Index.vue"
import { getPluginInfoByPage } from '../../../api/plugin'
import type { PluginStoreInfo, PaginationInfo } from '../../../types/plugin'
import { pluginListReload } from '../../../utils/pluginListReload';

//插件信息
const plugins = ref<PluginStoreInfo[]>([])
//分页信息
const pagination = ref<PaginationInfo>({
    curretPage: 1,
    totalPages: 1
})
//初始化插件市场，获取第一页，以及分页信息
function loadPageData(page: number) {
    return getPluginInfoByPage(page).then(res => {
        plugins.value = res.data
        return res
    })
}

async function reload() {
    const res = await loadPageData(1)
    pagination.value = res.pagination
}

onMounted(async () => {
    reload()
})

async function handleCurrentChange(val: number) {
    const res = await getPluginInfoByPage(val)
    plugins.value = res.data
}

watch(() => pluginListReload.value, async () => {
    reload()
})

</script>

<style scoped>
.plugin-list-container {
    display: flex;
    height: calc(100% - 70px);
}

.plugin-page {
    padding: 20px;
    flex: 1;
    animation: fadeIn 0.5s;
}

.aside {
    position: relative;
}

/* 两列布局 */
.plugin-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
}

.pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {

    /* 在小屏幕上改为单列布局 */
    .plugin-grid {
        grid-template-columns: 1fr;
        gap: 15px;
    }
}
</style>
