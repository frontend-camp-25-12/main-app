import { ref, watch } from 'vue';
import {
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
  SUPPORTED_THEMES,
  Theme
} from '../../../share/plugins/constants';

// 当前主题状态
const currentTheme = ref<Theme>(DEFAULT_THEME);

// 初始化主题
export function initTheme() {
  // 从localStorage获取保存的主题设置
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

  if (savedTheme && SUPPORTED_THEMES.includes(savedTheme)) {
    currentTheme.value = savedTheme;
  } else {
    currentTheme.value = DEFAULT_THEME;
  }

  applyTheme(currentTheme.value);

  // 监听系统主题变化
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      applyTheme('system');
    });
  }
}

// 应用主题
export function applyTheme(theme: Theme) {
  // 更新当前主题状态
  currentTheme.value = theme;

  // 保存到localStorage
  localStorage.setItem(THEME_STORAGE_KEY, theme);

  // 获取实际应用的主题（如果是system则根据系统设置确定）
  const effectiveTheme = theme === 'system'
    ? getSystemTheme()
    : theme;

  // 更新html的class
  document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
}

// 获取系统主题
export function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

// 获取当前主题
export function getTheme(): Theme {
  return currentTheme.value;
}

// 设置主题
export function setTheme(theme: 'light' | 'dark' | 'system', fromIpc = false) {
  let effectiveTheme = theme;
  if (theme === 'system') {
    effectiveTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').onchange = () => {
      setTheme('system', true);
    };
  }
  document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  // 只有不是IPC广播时才通知主进程
  if (!fromIpc && window.electron) {
    window.electron.ipcRenderer.send('settings-changed', { type: 'theme', value: theme });
  }
}

// 监听主题变化
export function onThemeChange(callback: (theme: Theme) => void) {
  watch(currentTheme, callback);
}