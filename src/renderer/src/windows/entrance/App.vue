<script setup lang="ts">
import { ref, onMounted, Ref, useTemplateRef } from 'vue';
import { ElButton, ElInput, ElNotification, ElScrollbar } from 'element-plus';
import { PluginEnterAction, PluginMetadata } from '../../../../share/plugins/type';
import { t } from '../../utils/i18n';
import GridPlugin from './components/GridPlugin.vue';
import ListPlugin from './components/ListPlugin.vue';
import { PluginView } from './utils/plugin';
import { Grid, Expand } from '@element-plus/icons-vue';

let pluginList: PluginMetadata[] = [];
const pluginPath = ref('');
const searchInput = ref('');
const cmdInput = useTemplateRef<InstanceType<typeof ElInput>>('cmd-input');;

let displayedPlugins: Ref<PluginView[]> = ref([]);
const viewMode = ref<'grid' | 'list'>('list');

const fetchPlugins = async () => {
  const data = await window.ipcApi.pluginListRecent();
  pluginList = data || [];
  displayedPlugins.value = pluginList.filter(plugin => !plugin.internal?.hidden && !plugin.disabled).map(plugin => new PluginView(plugin));
};

const handleAddPlugin = async () => {
  if (!pluginPath.value.trim()) return;
  try {
    await window.ipcApi.pluginDevInstall(pluginPath.value.trim());
    pluginPath.value = '';
    await fetchPlugins();
    ElNotification.success({
      title: t('entrance.pluginAddSuccess'),
      message: t('entrance.pluginAddSuccess'),
      duration: 2000,
      position: 'bottom-right',
    });
  } catch (error: any) {
    ElNotification.error({
      title: t('entrance.pluginAddFailed'),
      message: error?.message || t('entrance.pluginAddFailed'),
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
  window.ipcApi.appConfigGet('entrance_viewMode', 'list').then(mode => {
    viewMode.value = mode || 'list';
  });
  window.ipcApi.onPluginListChange(() => {
    fetchPlugins();
  })
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key == 'Tab' || (event.ctrlKey || event.metaKey || event.shiftKey)) {
      return;
    }
    if (event.key === 'Escape') {
      window.platform.closeSelf();
      return;
    }
    if (cmdInput.value && document.activeElement !== cmdInput.value.$el) {
      cmdInput.value.focus();
    }
  });
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
    payload,
    from: payload ? 'cmd' : 'menu'
  };
  if (feat) {
    action.code = feat.code
  }
  window.ipcApi.pluginOpen(id, action);
  fetchPlugins();
  searchInput.value = '';
};

function switchViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid';
  window.ipcApi.appConfigSet('entrance_viewMode', viewMode.value);
}

function openFirstItem() {
  if (displayedPlugins.value.length > 0) {
    const firstPlugin = displayedPlugins.value[0];
    handleOpenPlugin(firstPlugin.id, firstPlugin.feature);
  }
}
</script>

<template>
  <div class="plugin-container">
    <div style="display: flex; gap: 8px;">
      <ElInput v-model="pluginPath" :placeholder="t('entrance.pluginPathPlaceholder')" @keyup.enter="handleAddPlugin"
        style="flex: 1" tabindex="-1"/>
      <ElButton type="primary" :disabled="!pluginPath.trim()" @click="handleAddPlugin" tabindex="-1">
        {{ t('entrance.addPlugin') }}
      </ElButton>
    </div>
    <div style="display: flex; gap: 8px;">
      <ElInput v-model="searchInput" class="cmd-input" :placeholder="t('entrance.searchPlaceholder')"
        @input="handleSearchInput" @keyup.enter="openFirstItem" size="large" ref="cmd-input" tabindex="-1"/>
      <ElButton tabindex="-1" @click="switchViewMode" :icon="viewMode === 'grid' ? Grid : Expand" circle size="large"
        style="font-size: 18px;">
      </ElButton>
    </div>

    <span class="plugin-category" v-if="searchInput.length">{{ t('entrance.commandMatch') }}</span>
    <span class="plugin-category" v-else>{{ t('entrance.recentlyUsed') }}</span>
    <ElScrollbar class="plugin-grid-container">
      <GridPlugin :plugins="displayedPlugins" @open-plugin="handleOpenPlugin" v-if="viewMode === 'grid'" />
      <ListPlugin :plugins="displayedPlugins" @open-plugin="handleOpenPlugin" v-else />
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
</style>