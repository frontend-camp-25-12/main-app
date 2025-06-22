<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElButton, ElInput, ElText, ElNotification, ElScrollbar } from 'element-plus';
import { PluginMetadata, SearchResult } from '../../../../share/plugins/type';
import icon from '../../../../../resources/icon.png';
import { t } from '../../utils/i18n';

const pluginList = ref<Record<string, PluginMetadata>>({});
const pluginPath = ref('');
const searchInput = ref('');
let fullPluginList: typeof pluginList.value = {};

const fetchPlugins = async () => {
  const data = await window.ipcApi.pluginList();
  pluginList.value = data || {};
  fullPluginList = data || {};
};

const handleAddPlugin = async () => {
  if (!pluginPath.value.trim()) return;
  try {
    await window.ipcApi.pluginAdd(pluginPath.value.trim());
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

const handleOpenPlugin = async (id: string) => {
  await window.ipcApi.pluginOpen(id);
};

const handleSearchInput = async () => {
  const query = searchInput.value.trim();
  if (!query) {
    pluginList.value = fullPluginList;
    return;
  }
  const filteredPlugins = await window.ipcApi.pluginSearch(query);
  pluginList.value = filteredPlugins.reduce((acc: Record<string, PluginMetadata>, search: SearchResult) => {
    acc[search.id] = fullPluginList[search.id];
    return acc;
  }, {});
};

onMounted(() => {
  fetchPlugins();
});
</script>

<template>
  <div class="plugin-container">
    <div style="display: flex; gap: 8px;">
      <ElInput v-model="pluginPath" placeholder="开发：输入插件文件夹路径，例如附带的demo插件./demo-plugin" @keyup.enter="handleAddPlugin"
        style="flex: 1" />
      <ElButton type="primary" :disabled="!pluginPath.trim()" @click="handleAddPlugin">
        添加插件
      </ElButton>
    </div>
    <ElInput v-model="searchInput" class="cmd-input" placeholder="Hi" @input="handleSearchInput"
      @keyup.enter="handleSearchInput" size="large" />
    <span class="plugin-category" v-if="searchInput.length">命令匹配</span>
    <span class="plugin-category" v-else>已安装插件</span>
    <ElScrollbar class="plugin-grid-container">
      <div v-if="Object.keys(pluginList).length" class="plugin-grid">
        <template v-for="(plugin, id) in pluginList" :key="id">
          <div v-if="!plugin?.internal?.hidden" class="plugin-item" @click="handleOpenPlugin(id)">
            <img width="40" :src="icon" alt="Plugin Icon" class="plugin-icon" />
            <ElText :line-clamp="2">{{ plugin.name }}</ElText>
          </div>
        </template>
      </div>
      <div v-else style="color: var(--el-text-color-secondary); animation: fadeIn 0.2s ease; padding: 8px;">暂无插件</div>
    </ElScrollbar>
  </div>
</template>

<style scoped>
.plugin-container {
  display: flex;
  flex-direction: column;
  height: 100vh;

  > *:not(.plugin-grid-container) {
    padding: 8px;
  }
}

.plugin-category {
  animation: fadeIn 0.2s ease;
}

.cmd-input {
  font-size: 20px;
}

.plugin-grid {
  padding: 12px 6px;
  flex: 1 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
}

.plugin-item {
  height: 78px;
  cursor: pointer;
  padding: 12px 4px;
  border-radius: var(--el-border-radius-base);
  transition: box-shadow 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  .el-text {
    transition: color 0.2s ease;
  }
}

.plugin-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  .el-text {
    --el-text-color: var(--el-color-primary);
  }
}
</style>
