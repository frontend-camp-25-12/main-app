<script setup lang="ts">
import { ref, onMounted, Ref, computed } from 'vue';
import { ElButton, ElFormItem, ElForm, ElTag } from 'element-plus';
import HotkeyInput from './components/HotkeyInput.vue';
import { HotkeyOption } from '../../../../share/plugins/hotkeys.type';
import { t } from '../../utils/i18n';
import icon from '../../../../../resources/icon.png';
import { PluginEnterAction } from '../../../../share/plugins/api.type';

const hotkeyOptions: Ref<HotkeyOption[]> = ref([]);
const pluginLogos: Ref<Record<string, string>> = ref({});
const dirtyPluginIds: Ref<Set<string>> = ref(new Set());
let initialHotkeyOptions: HotkeyOption[] = [];
// 计算是否有修改
const hasModifications = computed(() => {
  return dirtyPluginIds.value.size > 0;
});

function getKeyOfOption(id: string, code: string): string {
  return `${id}_${code}`;
}

const highlightOption = ref<string>(''); // 用于从其他插件拉起快捷键设置时的显示效果

function onPluginEnter(action: PluginEnterAction) {
  try {
    const { id, code } = JSON.parse(action.payload) as { id: string, code: string };
    highlightOption.value = getKeyOfOption(id, code);
  } catch (error) {
    console.error('Failed to parse plugin enter action:', error);
  }
}

window.platform.onPluginEnter(onPluginEnter);

onMounted(async () => {
  await fetchHotkeyOptions();
  window.ipcApi.pluginLogos().then((logos) => {
    pluginLogos.value = logos;
  });
  initialHotkeyOptions = JSON.parse(JSON.stringify(hotkeyOptions.value));
  window.platform.getLastPluginEnterAction().then((action) => {
    if (action) {
      onPluginEnter(action);
    }
  });
})

async function fetchHotkeyOptions() {
  hotkeyOptions.value = await window.ipcApi.listHotkeyOptions();
}

function handleHotkeyChange(id: string, code: string, value: string) {
  const initial = initialHotkeyOptions.find(item => item.id === id);
  if (initial) {
    const initialValue = initial.boundHotkey || ''; // initial值可能是undefined，按照空字符串（不绑定热键）来处理
    if (value != initialValue) {
      dirtyPluginIds.value.add(id);
    } else {
      dirtyPluginIds.value.delete(id);
    }
  }

  window.ipcApi.updateHotkeyBinding(id, code, value).then(() => {
    fetchHotkeyOptions();
  });
}

// 恢复到初始状态
async function undoChanges() {
  // 恢复所有修改到初始状态
  for (const id of dirtyPluginIds.value) {
    const initial = initialHotkeyOptions.find(item => item.id === id)!;
    await window.ipcApi.updateHotkeyBinding(initial.id, initial.code, initial.boundHotkey || '');
  }
  dirtyPluginIds.value.clear();
  await fetchHotkeyOptions();
}
</script>

<template>
  <div class="hotkeys-app">
    <div class="header">
      <h2>{{ t('hotkeyInput.title') }}</h2>
      <el-button v-if="hasModifications" type="primary" @click="undoChanges" style="animation: fadeIn 0.2s ease;">
        {{ t('hotkeyInput.undo') }}
      </el-button>
    </div>
    <el-form label-width="300px">
      <el-form-item v-for="(item, index) in hotkeyOptions" :key="index" class="option"
        :class="{ 'option-highlight': getKeyOfOption(item.id, item.code) === highlightOption }">
        <template #label>
          <div class="option-label-container">
            <el-tag v-if="dirtyPluginIds.has(item.id)" type="success" effect="light" round>
              {{ t('hotkeyInput.modified') }}
            </el-tag>
            <img width="32" :src="pluginLogos[item.id] ? `file:///${pluginLogos[item.id]}` : icon" alt="logo"
              class="plugin-icon" />
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

h2 {
  margin: 0;
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

.option {
  margin-bottom: 0;
  padding: 10px;
  border-radius: var(--el-border-radius-base);
  transition: box-shadow 0.3s ease;
}

.option-highlight {
  box-shadow: 0 0 10px var(--el-color-primary-light-5);
}
</style>