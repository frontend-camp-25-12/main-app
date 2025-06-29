<template>
    <div class="plugin-list-container">
        <div class="plugin-page">
            <div class="category-filters">
                <div class="category-btn active">全部</div>
                <div class="category-btn" @click="filterplugin('效率工具')">
                    效率工具
                </div>
                <div class="category-btn" @click="filterplugin('开发者工具')">
                    开发者工具
                </div>
                <div class="category-btn" @click="filterplugin('设计工具')">
                    设计工具
                </div>
            </div>

            <div class="plugin-grid">
                <PluginCard v-for="plugin in plugins" :key="plugin.id" :plugin="plugin"
                    @select-plugin="showDetail(plugin.id)">
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
import { ref, } from 'vue'
import PluginCard from "../PluginCard/Index.vue";
import { useRouter } from "vue-router";
import { getPluginInfoByPage } from '../../../api/plugin'

const router = useRouter();

//插件信息
const plugins = ref([])
//分页信息
const pagination = ref({})
//初始化插件市场，获取第一页，以及分页信息
getPluginInfoByPage(1).then((res) => {
    plugins.value = res.data
    pagination.value = res.pagination
})

//页码改变时获取对应页的插件信息
async function handleCurrentChange(val: number) {
    const res = await getPluginInfoByPage(val)
    plugins.value = res.data
}


//显示插件分类
function filterplugin(category): void { }
//PluginCard 选中插件事件的处理函数,跳转到对应详情页面
function showDetail(pluginId): void {
    router.push({
        name: "PluginDetail",
        params: { pluginId }
    });
}

</script>

<style scoped>
.plugin-list-container {
    padding: 20px;
}

.plugin-page {
    animation: fadeIn 0.5s;
}

.page-title {
    margin: 20px 0 15px;
    font-size: 22px;
    font-weight: 700;
    color: #222;
}

.category-filters {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    overflow-x: auto;
    padding-bottom: 8px;
}

.category-btn {
    padding: 7px 12px;
    background: var(--white);
    border: 1px solid var(--medium-gray);
    border-radius: 20px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.3s;
    white-space: nowrap;
}

.category-btn.active,
.category-btn:hover {
    background: var(--primary-color);
    color: var(--white);
    border-color: var(--primary-color);
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

    .category-filters {
        gap: 6px;
    }
}
</style>
