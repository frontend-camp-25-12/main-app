<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue';
import { ElButton, ElInput, ElNotification, ElScrollbar } from 'element-plus';
import { PluginEnterAction, PluginMetadata, SearchResult } from '../../../../share/plugins/type';
import { t } from '../../utils/i18n';
import GridPlugin from './components/GridPlugin.vue';
import { PluginView } from './utils/plugin';
import { setSkin } from '../../utils/skin';

let pluginList: Record<string, PluginMetadata> = {};
const pluginPath = ref('');
const searchInput = ref('');

let displayedPlugins: Ref<PluginView[]> = ref([]);

const fetchPlugins = async () => {
  const data = await window.ipcApi.pluginList();
  pluginList = data || {};
  displayedPlugins.value = Object.values(pluginList).filter(plugin => !plugin.internal?.hidden).map(plugin => new PluginView(plugin));
};

const handleAddPlugin = async () => {
  if (!pluginPath.value.trim()) return;
  try {
    await window.ipcApi.pluginDevInstall(pluginPath.value.trim());
    pluginPath.value = '';
    await fetchPlugins();
    ElNotification.success({
      title: t('pluginAddSuccess'),
      message: t('pluginAddSuccess'),
      duration: 2000,
      position: 'bottom-right',
    });
  } catch (error: any) {
    ElNotification.error({
      title: t('pluginAddFailed'),
      message: error?.message || t('pluginAddFailed'),
      duration: 5000,
      position: 'bottom-right',
    });
  }
};

const handleSearchInput = async () => {
  const query = searchInput.value.trim();
  if (!query) {
    fetchPlugins();
    return;
  }
  const filteredPlugins = await window.ipcApi.pluginSearch(query);
  displayedPlugins.value = PluginView.fromSearchResult(pluginList, filteredPlugins)
};

onMounted(() => {
  fetchPlugins();
  if (window.electron) {
    window.electron.ipcRenderer.on('settings-changed', (_event, payload) => {
      if (payload.type === 'skin') {
        setSkin(payload.value, payload.color, true);
      }
    });
  }
});

if (import.meta.env.DEV) {
  ElNotification({
    title: '当前是vite dev server环境',
    message: '插件的logo将无法正常加载显示，可通过使用npm run start启动部署环境的应用来解决。'
  })
}

function handleOpenPlugin(id: string, feat: PluginView['feature']) {
  const payload = searchInput.value
  let action: PluginEnterAction = {
    code: '',
    payload
  };
  if (feat) {
    action.code = feat.code
  }
  return window.ipcApi.pluginOpen(id, action);
};
</script>

<template>
  <div class="plugin-container">
    <div style="display: flex; gap: 8px;">
      <ElInput v-model="pluginPath" :placeholder="t('pluginPathPlaceholder')" @keyup.enter="handleAddPlugin"
        style="flex: 1" />
      <ElButton type="primary" :disabled="!pluginPath.trim()" @click="handleAddPlugin">
        {{ t('addPlugin') }}
      </ElButton>
    </div>
    <ElInput v-model="searchInput" class="cmd-input" :placeholder="t('searchPlaceholder')" @input="handleSearchInput"
      @keyup.enter="handleSearchInput" size="large" />
    <span class="plugin-category" v-if="searchInput.length">{{ t('commandMatch') }}</span>
    <span class="plugin-category" v-else>{{ t('installedPlugins') }}</span>
    <ElScrollbar class="plugin-grid-container">
      <GridPlugin :plugins="displayedPlugins" @open-plugin="handleOpenPlugin" />
    </ElScrollbar>
  </div>
</template>

<style scoped>
.plugin-container {
  display: flex;
  flex-direction: column;
  height: 100vh;

  >*:not(.plugin-grid-container) {
    padding: 8px;
  }
}

.plugin-category {
  animation: fadeIn 0.2s ease;
}

.cmd-input {
  font-size: 20px;
}

.el-button--primary {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: #fff !important;
}
.el-button--primary:hover,
.el-button--primary:focus {
  background-color: var(--primary-dark-color) !important;
  border-color: var(--primary-dark-color) !important;
}

.el-button--primary {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: #fff !important;
  transition: background-color 0.3s, border-color 0.3s;
}

.el-input__inner:focus {
  border-color: var(--primary-color) !important;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color) 30%, transparent);
}

.button-primary {
  background: var(--primary-color);
}
.page-title {
  color: var(--title-color);
}
</style>
