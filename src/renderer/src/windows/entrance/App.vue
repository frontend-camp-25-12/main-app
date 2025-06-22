<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElButton, ElInput, ElText, ElNotification } from 'element-plus';
import { IpcChannel } from '../../../../share/ipcChannel';
import { PluginMetadata } from '../../../../share/plugins/type';
import icon from '../../../../../resources/icon.png';
import { t } from '../../plugins/i18n';

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
  await window.electron.ipcRenderer.invoke(IpcChannel.PluginOpen, id);
};

const handleOpenSettings = async () => {
  await window.electron.ipcRenderer.invoke(IpcChannel.PluginOpen, 'builtin.settings');
};

onMounted(() => {
  fetchPlugins();
});
</script>

<template>
  <div class="entrance-container">
    <div class="header">
      <h1>{{ t('appName') }}</h1>
      <ElButton type="primary" plain @click="handleOpenSettings">
        {{ t('openSettings') }}
      </ElButton>
    </div>
    
    <div class="plugin-input">
      <ElInput 
        v-model="pluginPath" 
        :placeholder="t('pluginPathPlaceholder')"
        @keyup.enter="handleAddPlugin" 
      />
      <ElButton 
        type="primary" 
        :disabled="!pluginPath.trim()" 
        @click="handleAddPlugin"
      >
        {{ t('addPlugin') }}
      </ElButton>
    </div>
    
    <div v-if="Object.keys(pluginList).length" class="plugin-grid">
      <template v-for="(plugin, id) in pluginList" :key="id">
        <div 
          v-if="!plugin?.internal?.hidden" 
          class="plugin-item" 
          @click="handleOpenPlugin(id)"
        >
          <img width="40" :src="icon" alt="Plugin Icon" class="plugin-icon" />
          <ElText truncated size="large">{{ plugin.name }}</ElText>
        </div>
      </template>
    </div>
    <div v-else class="no-plugins">
      {{ t('noPlugins') }}
    </div>
  </div>
</template>

<style scoped>
.entrance-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: var(--text-color);
}

.plugin-input {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.plugin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 20px;
}

.plugin-item {
  cursor: pointer;
  padding: 15px;
  border-radius: var(--el-border-radius-base);
  background-color: var(--plugin-item-bg);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 1px solid var(--border-color);
}

.plugin-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px var(--shadow-color);
  background-color: var(--plugin-item-hover-bg);
}

.plugin-icon {
  margin-bottom: 10px;
}

.no-plugins {
  text-align: center;
  color: var(--text-color);
  opacity: 0.7;
  padding: 40px 0;
  font-size: 16px;
}
</style>