import { ref, watch } from 'vue';
import { 
  THEME_STORAGE_KEY, 
  DEFAULT_THEME, 
  SUPPORTED_THEMES 
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
      if (currentTheme.value === 'system') {
        applyTheme('system');
      }
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
  
  // 更新Element Plus主题
  updateElementTheme(effectiveTheme);
}

// 获取系统主题
export function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
}

// 更新Element Plus主题
function updateElementTheme(theme: 'light' | 'dark') {
  // 移除现有主题样式
  const existingTheme = document.getElementById('element-theme');
  if (existingTheme) {
    existingTheme.remove();
  }
  
  // 如果是深色主题，加载Element Plus的深色主题CSS
  if (theme === 'dark') {
    const link = document.createElement('link');
    link.id = 'element-theme';
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/element-plus/theme-chalk/dark/css-vars.css';
    document.head.appendChild(link);
  }
}

// 获取当前主题
export function getTheme(): Theme {
  return currentTheme.value;
}

// 设置主题
export function setTheme(theme: Theme) {
  applyTheme(theme);
}

// 监听主题变化
export function onThemeChange(callback: (theme: Theme) => void) {
  watch(currentTheme, callback);
}