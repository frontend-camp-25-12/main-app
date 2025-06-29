import { ref,} from 'vue';
import {
  Theme
} from '../../../share/plugins/constants';

// 当前主题状态
const currentTheme = ref(await window.ipcApi.getColorMode())


// 获取当前主题
export function getTheme(): Theme {
  return currentTheme.value;
}

// 设置主题
export function setTheme(theme: 'light' | 'dark' | 'system', fromIpc = false) {
  window.ipcApi.setColorMode(theme)
}