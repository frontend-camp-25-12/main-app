<template>
    <!-- 侧栏组件 -->
    <div class="sidebar-container">
        <div class="sidebar-header">
            <div class="sidebar-title">
                {{ t('pluginStore.installedSection') }}
            </div>
            <div class="divider"></div>
        </div>
        <ElScrollbar class="sidebar-section">
            <ul class="plugin-list">
                <li v-for="plugin in externalPlugins" class="plugin-item" :key="plugin.id + plugin.version">
                    <img width="36" height="36" :src="plugin.logoPath" alt="">
                    <div class=" plugin-info">
                        <div class="plugin-name">{{ tPluginName(plugin) }}</div>
                        <div class="plugin-version">
                            {{ plugin.version }}
                            <span class="plugin-disabled-label"
                                :style="{ visibility: plugin.disabled ? 'visible' : 'hidden' }">
                                <span>{{ t('pluginStore.notEnabled') }}</span>
                            </span>
                        </div>
                        <div class="plugin-usedAt" v-if="plugin.usedAt && plugin.usedAt !== 0">
                            {{ t('pluginStore.lastUsed', { time: formatDateNow(new Date(plugin.usedAt)) }) }}</div>
                    </div>
                    <div class="plugin-actions">
                        <el-dropdown trigger="click" class="plugin-dropdown">
                            <el-icon>
                                <MoreFilled />
                            </el-icon>
                            <template #dropdown>
                                <el-dropdown-menu>
                                    <el-dropdown-item @click="toggleDisabled(plugin)">{{ plugin.disabled ?
                                        t('pluginStore.enable') : t('pluginStore.disable') }}</el-dropdown-item>
                                    <el-dropdown-item @click="uninstallPlugin(plugin)">{{ t('pluginStore.uninstall')
                                    }}</el-dropdown-item>
                                </el-dropdown-menu>
                            </template>
                        </el-dropdown>
                    </div>
                </li>
            </ul>
        </ElScrollbar>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PluginMetadata } from 'src/share/plugins/type';
import { installedPkg } from '../../../../utils/installedPkg';
import { formatDateNow } from '../../../../utils/timeFormat';
import { ElScrollbar, ElIcon } from 'element-plus';
import { MoreFilled } from '@element-plus/icons-vue';
import { t } from '../../../../../../utils/i18n';
import { tPluginName } from '../../../../../../utils/plugin-i18n'

const externalPlugins = computed(() => {
    const plugins: PluginMetadata[] = []
    for (const key in installedPkg.value) {
        if (!installedPkg.value[key].internal) {
            plugins.push(installedPkg.value[key])
        }
    }
    return plugins
})

function toggleDisabled(plugin: PluginMetadata) {
    if (plugin.disabled) {
        window.ipcApi.pluginEnable(plugin.id)
    } else {
        window.ipcApi.pluginDisable(plugin.id)
    }
}

function uninstallPlugin(plugin: PluginMetadata) {
    window.ipcApi.pluginRemove(plugin.id, plugin.version)
}
</script>

<style scoped>
.sidebar-container {
    width: 260px;
    background: var(--el-bg-color);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
}

.sidebar-header {
    padding: 16px 16px 0 16px;
}

.sidebar-title {
    font-size: 15px;
    color: var(--el-text-color-regular);
    display: flex;
    align-items: center;
}

.divider {
    height: 1px;
    background-color: var(--el-border-color-light);
    margin-top: 16px;
}

.plugin-list {
    list-style: none;
    max-width: 100%;
}

.plugin-item {
    padding: 4px 8px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    color: var(--el-text-color-primary);
}

.sidebar-section {
    flex: 1;
    padding: 0 16px;
}

.plugin-usedAt {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-wrap: nowrap;
}

.plugin-disabled-label {
    color: var(--el-color-warning);
    margin-left: 6px;
}

.plugin-actions {
    display: flex;
    flex-direction: column;
    align-items: end;

    >* {
        margin: 2px 0
    }
}

.plugin-dropdown {
    cursor: pointer;
}

.plugin-info {
    flex: 1;
    margin: 0 8px;
}

.plugin-version {
    font-size: 14px;
    color: var(--el-text-color-secondary);
}
</style>
