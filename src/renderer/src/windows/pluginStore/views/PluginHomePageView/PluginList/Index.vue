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
        </div>
    </div>
</template>

<script setup lang="ts">
import PluginCard from "../PluginCard/Index.vue";
import { useRouter } from "vue-router";

const router = useRouter();
//显示插件分类
function filterplugin(category): void { }
//PluginCard 选中插件事件的处理函数,跳转到对应详情页面
function showDetail(pluginId): void {
    router.push({
        name: "PluginDetail",
        params: { pluginId }
    });
}
//插件数据
const plugins = [
    {
        id: 1,
        name: "局域网数据传输",
        logo: "fas fa-search",
        description: "局域网数据传输",
        version: "1.0,0",
        category: "效率工具",
        rating: 9.3,
        downloads: 12000
    }
];
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
