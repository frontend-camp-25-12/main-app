<script setup lang="ts">
import { ref, onMounted, Ref, computed } from 'vue';
import { ElButton, ElFormItem, ElForm, ElTag, ElMessageBox } from 'element-plus';
import HotkeyInput from './components/HotkeyInput.vue';
import { HotkeyOption } from '../../../../share/plugins/hotkeys.type';
import { t } from '../../utils/i18n';
import icon from '../../../../../resources/icon/icon.png';
import { PluginEnterAction } from '../../../../share/plugins/api.type';

const hotkeyOptions: Ref<HotkeyOption[]> = ref([]);
const pluginLogos: Ref<Record<string, string>> = ref({});
const dirtyPluginKeys: Ref<Set<string>> = ref(new Set());
let initialHotkeyOptions: HotkeyOption[] = [];

// 不可用的快捷键组合列表
const invalidHotkeyPatterns = [
  'Alt', // 仅Alt键
  'Shift', // 仅Shift键
  'CmdOrCtrl', // 仅Cmd或Ctrl键
  'Meta', // 仅Meta键（Windows键或Mac Command键）
  'Super', // 仅Super键（部分Linux桌面）
  'Win',   // 仅Win键（Windows）
  'Esc',                 // Escape键
  'Delete',              // Delete键
  'Backspace',          // Backspace键
  'Enter',               // Enter键
  'Space',               // 空格键
  'Tab',                 // Tab键
  'Home',                // Home键
  'End',                 // End键
  'PageUp',             // Page Up键
  'PageDown',           // Page Down键
  'ArrowUp',            // 上箭头键
  'ArrowDown',          // 下箭头键
  'ArrowLeft',          // 左箭头键
  'ArrowRight',         // 右箭头键
  'Alt+Shift',           // 系统输入法切换
  'Alt+Tab',             // 系统窗口切换
  'CmdOrCtrl+Alt+Delete', // 系统任务管理器（Windows）
  'CmdOrCtrl+Shift+Esc', // 任务管理器
  'Alt+F4',              // 关闭窗口
  'CmdOrCtrl+L',         // 地址栏聚焦（浏览器）
  'CmdOrCtrl+T',         // 新标签页（浏览器）
  'CmdOrCtrl+W',         // 关闭标签页（浏览器）
  'CmdOrCtrl+Shift+T',   // 恢复关闭的标签页（浏览器）
  'F11',                 // 全屏切换
  'CmdOrCtrl+F11',       // 全屏切换
  'Alt+Enter',           // 属性/全屏切换
  'CmdOrCtrl+Shift+N',   // 新无痕窗口（浏览器）
  'CmdOrCtrl+R',         // 刷新页面
  'CmdOrCtrl+F5',        // 强制刷新
  'F5',                  // 刷新
  'Shift+F5',            // 强制刷新
  'CmdOrCtrl+D',         // 书签/收藏
  'CmdOrCtrl+H',         // 历史记录
  'CmdOrCtrl+J',         // 下载记录
  'CmdOrCtrl+U',         // 查看源代码
  'F12',                 // 开发者工具
  'CmdOrCtrl+Shift+I',   // 开发者工具
  'CmdOrCtrl+Shift+C',   // 元素选择器
  'CmdOrCtrl+Shift+J',   // 控制台
  'Alt+Left',            // 浏览器后退
  'Alt+Right',           // 浏览器前进
  'CmdOrCtrl+Left',      // 浏览器后退（Mac）
  'CmdOrCtrl+Right',     // 浏览器前进（Mac）
  'CmdOrCtrl+Shift+Delete', // 清除浏览数据
  'CmdOrCtrl+Plus',      // 放大
  'CmdOrCtrl+-',         // 缩小
  'CmdOrCtrl+0',         // 重置缩放
];

// 检查快捷键是否为不可用组合
function isInvalidHotkey(hotkey: string): boolean {
  return invalidHotkeyPatterns.includes(hotkey);
}
// 计算是否有修改
const hasModifications = computed(() => {
  return dirtyPluginKeys.value.size > 0;
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

async function handleHotkeyChange(id: string, code: string, value: string, reset: () => void) {
  // 检查是否为不可用的快捷键组合
  if (isInvalidHotkey(value)) {
    await ElMessageBox.alert(
      t('hotkeyInput.invalidMessage', {
        hotkey: value
      }),
      t('hotkeyInput.invalidTitle'),
      {
        confirmButtonText: t('confirm'),
        type: 'warning'
      }
    );

    reset(); // 重置输入框
    return;
  }

  // 检查快捷键冲突
  const conflictOption = hotkeyOptions.value.find(option =>
    option.boundHotkey === value &&
    !(option.id === id && option.code === code) // 自己除外
  );

  if (conflictOption) {
    // 冲突了，弹窗
    await ElMessageBox.alert(
      t('hotkeyInput.conflictMessage', {
        hotkey: value,
        pluginName: conflictOption.pluginName,
        feature: conflictOption.label
      }),
      t('hotkeyInput.conflictTitle'),
      {
        confirmButtonText: t('confirm'),
        type: 'warning'
      }
    );

    reset(); // 重置输入框
    return;
  }

  // 一切正常，更新热键绑定
  const initial = initialHotkeyOptions.find(item => item.id === id);
  if (initial) {
    const initialValue = initial.boundHotkey || ''; // initial值可能是undefined，按照空字符串（不绑定热键）来处理
    if (value != initialValue) {
      dirtyPluginKeys.value.add(getKeyOfOption(id, code));
    } else {
      dirtyPluginKeys.value.delete(getKeyOfOption(id, code));
    }
  }

  window.ipcApi.updateHotkeyBinding(id, code, value).then(() => {
    fetchHotkeyOptions();
  });
}

// 恢复到初始状态
async function undoChanges() {
  // 恢复所有修改到初始状态
  for (const key of dirtyPluginKeys.value) {
    const initial = initialHotkeyOptions.find(item => getKeyOfOption(item.id, item.code) === key)!;
    await window.ipcApi.updateHotkeyBinding(initial.id, initial.code, initial.boundHotkey || '');
  }
  dirtyPluginKeys.value.clear();
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
    <el-form label-width="350px">
      <el-form-item v-for="item in hotkeyOptions" :key="getKeyOfOption(item.id, item.code)" class="option"
        :class="{ 'option-highlight': getKeyOfOption(item.id, item.code) === highlightOption }">
        <template #label>
          <div class="option-label-container">
            <el-tag v-if="dirtyPluginKeys.has(getKeyOfOption(item.id, item.code))" type="success" effect="light" round>
              {{ t('hotkeyInput.modified') }}
            </el-tag>
            <img width="32" :src="pluginLogos[item.id] ? `${pluginLogos[item.id]}` : icon" alt="logo"
              class="plugin-icon" />
            <span class="option-plugin-name">{{ item.pluginName }}</span>
            <span class="option-label">{{ item.label }}</span>
          </div>
        </template>
        <HotkeyInput @change="(v, reset) => handleHotkeyChange(item.id, item.code, v, reset)" :initial-value="item.boundHotkey" />
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.hotkeys-app {
  padding: 20px;
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