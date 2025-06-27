<script setup lang="ts">
import { ref, onMounted, Ref } from 'vue';
import { ElButton, ElInput, ElNotification, ElScrollbar, ElFormItem, ElForm } from 'element-plus';
import HotkeyInput from './components/HotkeyInput.vue';
import { HotkeyOption } from '../../../../share/plugins/hotkeys.type';
import { t } from '../../utils/i18n';
import icon from '../../../../../resources/icon.png';

const hotkeyOptions: Ref<HotkeyOption[]> = ref([]);
const pluginLogos: Ref<Record<string, string>> = ref({});

onMounted(async () => {
  fetchHotkeyOptions();
  window.ipcApi.pluginLogos().then((logos) => {
    pluginLogos.value = logos;
  });
})

async function fetchHotkeyOptions() {
  hotkeyOptions.value = await window.ipcApi.listHotkeyOptions();
}

function handleHotkeyChange(id: string, code: string, value: string) {
  window.ipcApi.updateHotkeyBinding(id, code, value).then(() => {
    fetchHotkeyOptions();
  });
}
</script>

<template>
  <div class="hotkeys-app">
    <h2>{{ t('hotkeyInput.title') }}</h2>
    <el-form label-width="300px">
      <el-form-item v-for="(item, index) in hotkeyOptions" :key="index">
        <template #label>
          <div class="option-label-container">
            <img width="32" :src="pluginLogos[item.id] ? `file:///${pluginLogos[item.id]}` : icon" alt="logo" class="plugin-icon" />
            <span class="option-plugin-name">{{ item.pluginName }}</span>
            <span class="option-label">{{ item.label }}</span>
          </div>
        </template>
        <HotkeyInput @change="(v) => handleHotkeyChange(item.id, item.code, v)" :initial-value="item.boundHotkey" />
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.hotkeys-app {
  padding: 20px;
  max-width: 600px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}

.option-plugin-name {
  color: var(--el-text-color-secondary);
}

.option-label-container {

  display: flex;
  align-items: center;

  >* {
    margin-right: 6px;
  }
}

.option-label {
  font-weight: bold;
}
</style>