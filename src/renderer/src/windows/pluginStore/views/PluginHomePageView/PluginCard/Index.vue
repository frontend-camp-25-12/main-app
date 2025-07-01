<template>
    <div class="plugin-card-container">
        <div class="plugin-image">
            <img v-if="plugin.logo" :src="plugin.logo" :alt="plugin.name" class="plugin-logo" />
            <div v-else class="default-icon">
                <span>{{ plugin.name.charAt(0).toUpperCase() }}</span>
            </div>
        </div>
        <div class="plugin-info">
            <div class="plugin-title">
                <span>{{ plugin.name }}</span>
            </div>
            <div class="plugin-description">{{ plugin.description || '暂无描述' }}</div>
            <div class="plugin-footer">
                <span>{{ installedPkg[plugin.id] && updateAvaliable(plugin) ? `${installedPkg[plugin.id].version} →` :
                    '' }}{{
                        plugin.version }}</span>
                <span style="margin-left: auto; margin-right: 6px;">{{ formatFileSize(plugin.size) }}</span>
                <ElButton size="small" v-if="!installedPkg[plugin.id]" @click="installPlugin(plugin)">安装</ElButton>
                <ElButton size="small" type="primary" v-else-if="updateAvaliable(plugin)" @click="updatePlugin(plugin)">
                    更新</ElButton>
                <div v-else class="plugin-installed">
                    <el-icon size="18">
                        <SuccessFilled color="var(--el-color-success)" />
                    </el-icon>
                    已安装
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { formatFileSize } from '../../../utils/fileSizeFormat';
import type { PluginStoreInfo } from '../../../types/plugin'
import { ElButton } from 'element-plus';
import { installedPkg } from '../../../utils/installedPkg';
import { ElIcon } from 'element-plus';
import { SuccessFilled } from '@element-plus/icons-vue';
import { compareVersions } from 'compare-versions';

defineProps<{
    plugin: PluginStoreInfo
}>();

function installPlugin(plugin: PluginStoreInfo) {
    window.ipcApi.pluginFetchInstall(plugin.id)
}

function updateAvaliable(plugin: PluginStoreInfo) {
    if (!installedPkg.value[plugin.id]) {
        return false
    }
    return compareVersions(installedPkg.value[plugin.id].version, plugin.version) === -1
};

function updatePlugin(plugin: PluginStoreInfo) {
    window.ipcApi.pluginFetchInstall(plugin.id)
}
</script>

<style scoped>
.plugin-card-container {
    background: var(--el-bg-color);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.3s;
    box-shadow: var(--el-box-shadow-light);
    display: flex;
    align-items: center;
    padding: 12px;
    align-items: stretch;
}


.plugin-image {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-bg-color);
    font-size: 24px;
    margin-right: 15px;
    flex-shrink: 0;
    overflow: hidden;
}

.plugin-logo {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.default-icon {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 20px;
}

.plugin-info {
    flex: 1;
    padding: 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.plugin-title {
    font-size: 15px;
    font-weight: 600;
    margin-bottom: 6px;
    display: flex;
    justify-content: space-between;
}

.plugin-description {
    color: var(--el-text-color-regular);
    font-size: 14px;
    margin-bottom: 10px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.4;
    flex: 1;
}

.plugin-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: var(--el-text-color-secondary);
    font-size: 13px;
}

.plugin-installed {
    display: flex;
    align-items: center;
    color: var(--el-color-success);
}

/* 响应式设计 */
@media (max-width: 768px) {
    .plugin-card-container {
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
    .plugin-card-container {
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
        line-clamp: 1;
    }

    .plugin-footer {
        font-size: 10px;
    }
}
</style>
