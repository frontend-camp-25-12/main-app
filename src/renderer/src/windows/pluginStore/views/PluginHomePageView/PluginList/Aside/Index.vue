<template>
    <!-- 侧栏组件 -->
    <div class="sidebar-container">
        <div class="sidebar-header">
            <div class="sidebar-title">
                已安装的插件
            </div>
            <div class="divider"></div>
            <div class="sidebar-section">
                <ul class="plugin-list">
                    <li @click="showDetail(plugin.id)" v-for="plugin in externalPlugins" class="plugin-item">
                        <div class="plugin-logo">
                            <img width="32" :src="plugin.logoPath" alt="">
                        </div>
                        {{ plugin.name }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="user-profile">
            <div class="user-avatar">U</div>
            <div class="user-info">
                <div class="user-name">插件开发者</div>
                <div class="user-email">developer@example.com</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount, ref, computed } from 'vue';
import { PluginMetadata } from 'src/share/plugins/type';

const installedPlugins = ref<Record<string, PluginMetadata>>({})

const emit = defineEmits(['show-detail'])

onBeforeMount(async () => {
    installedPlugins.value = await window.ipcApi.pluginList()
})

const externalPlugins = computed(() => {
    const plugins: PluginMetadata[] = []
    for (const key in installedPlugins.value) {
        if (!installedPlugins.value[key].internal) {
            plugins.push(installedPlugins.value[key])
        }
    }
    return plugins
})

function showDetail(pluginId) {
    emit('show-detail', pluginId)
}


</script>

<style scoped>
.sidebar-container {
    width: 240px;
    background: white;
    padding: 20px;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.sidebar-header {
    padding-bottom: 15px;
    margin-bottom: 15px;
}

.sidebar-title {
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    display: flex;
    align-items: center;
}

.divider {
    height: 1px;
    background-color: #eaedf3;
    margin: 20px 0;
}

.plugin-list {
    list-style: none;
}

.plugin-item {
    padding: 10px 15px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #555;
}

.plugin-item:hover {
    background-color: #f0f5ff;
    color: #1a73e8;
}

.plugin-item.active {
    background-color: #e8f0fe;
    color: #1a73e8;
    font-weight: 500;
}

.plugin-logo {
    margin-right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.user-profile {
    display: flex;
    align-items: center;
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #eaedf3;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    font-size: 18px;
    margin-right: 10px;
}

.user-info {
    line-height: 1.3;
}

.user-name {
    font-weight: 500;
    font-size: 14px;
}

.user-email {
    font-size: 12px;
    color: #7f7f7f;
}
</style>
