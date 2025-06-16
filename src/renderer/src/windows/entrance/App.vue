<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElButton, ElInput, ElText, ElNotification } from 'element-plus';
import { IpcChannel } from '../../../../share/ipcChannel';
import { PluginMetadata } from '../../../../share/plugins/type';
import icon from '../../../../../resources/icon.png';

const pluginList = ref<Record<string, PluginMetadata>>({});
const pluginPath = ref('');

const fetchPlugins = async () => {
  const data = await window.electron.ipcRenderer.invoke(IpcChannel.PluginList);
  pluginList.value = data || {};
};

const handleAddPlugin = async () => {
  if (!pluginPath.value.trim()) return;
  try {
    await window.electron.ipcRenderer.invoke(IpcChannel.PluginAdd, pluginPath.value.trim());
    pluginPath.value = '';
    await fetchPlugins();
    ElNotification.success({
      title: '插件添加成功',
      message: '插件已成功添加',
      duration: 2000,
      position: 'bottom-right',
    });
  } catch (error: any) {
    ElNotification.error({
      title: '添加插件失败',
      message: error?.message || '未知错误',
      duration: 5000,
      position: 'bottom-right',
    });
  }
};

const handleOpenPlugin = async (id: string) => {
  await window.electron.ipcRenderer.invoke(IpcChannel.PluginOpen, id);
};

onMounted(() => {
  fetchPlugins();
});
</script>

<template>
  <div style="display: flex; gap: 8px; margin-bottom: 16px;">
    <ElInput v-model="pluginPath" placeholder="开发：输入插件文件夹路径，例如附带的demo插件./demo-plugin"
      @keyup.enter="handleAddPlugin" style="flex: 1" />
    <ElButton type="primary" :disabled="!pluginPath.trim()" @click="handleAddPlugin">
      添加插件
    </ElButton>
  </div>
  <div v-if="Object.keys(pluginList).length" class="plugin-grid">
    <template v-for="(plugin, id) in pluginList" :key="id">
      <div v-if="!plugin?.internal?.hidden" class="plugin-item" @click="handleOpenPlugin(id)">
        <img width="40" :src="icon" alt="Plugin Icon" class="plugin-icon" />
        <ElText truncated size="large">{{ plugin.name }}</ElText>
      </div>
    </template>
  </div>
  <div v-else style="color: #888;">暂无插件</div>
</template>

<style scoped>
.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 16px;
}

.plugin-item {
  cursor: pointer;
  padding: 16px;
  border-radius: var(--el-border-radius-base);
  transition: box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.plugin-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
</style>