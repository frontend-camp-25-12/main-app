<template>
    <div class="plugin-card-container" @click="selectplugin">
        <div class="plugin-image">
            <i :class="plugin.icon"></i>
        </div>
        <div class="plugin-info">
            <div class="plugin-title">
                <span>{{ plugin.name }}</span>
            </div>
            <div class="plugin-description">{{ plugin.description }}</div>
            <div class="plugin-meta">
                <span>{{ plugin.rating }}分 · {{ formatDownloads }}次下载</span>
                <span>{{ plugin.category }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
const props = defineProps(["plugin"]);
const emit = defineEmits(["select-plugin"]);

//格式化后的下载数量
const formatDownloads = computed(() => {
    if (props.plugin.downloads >= 10000) {
        return `${(props.plugin.downloads / 10000).toFixed(1)}万`;
    }
    return props.plugin.downloads;
});

//用户选择插件后向上抛事件
function selectplugin(): void {
    emit("select-plugin", props.plugin.id);
}
</script>

<style scoped>
.plugin-card-container {
    background: var(--white);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s;
    box-shadow: var(--shadow);
    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 12px;
}

.plugin-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.plugin-image {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4776e6, #8e54e9);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    margin-right: 15px;
    flex-shrink: 0;
}

.plugin-info {
    flex: 1;
    padding: 0;
    min-width: 0;
}

.plugin-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
}

.plugin-description {
    color: var(--dark-gray);
    font-size: 12px;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
}

.plugin-meta {
    display: flex;
    justify-content: space-between;
    color: #999;
    font-size: 11px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .plugin-card {
        padding: 10px;
    }

    .plugin-image {
        width: 50px;
        height: 50px;
        font-size: 20px;
        margin-right: 12px;
    }
}

@media (max-width: 480px) {
    .plugin-card {
        padding: 8px;
    }

    .plugin-image {
        width: 48px;
        height: 48px;
        font-size: 20px;
        margin-right: 12px;
    }

    .plugin-title {
        font-size: 13px;
    }

    .plugin-description {
        font-size: 11px;
        margin-bottom: 8px;
        -webkit-line-clamp: 1;
    }

    .plugin-meta {
        font-size: 10px;
    }
}
</style>
