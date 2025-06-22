import { ref, watch } from 'vue';
import { 
  SKIN_STORAGE_KEY, 
  DEFAULT_SKIN,
  PRESET_SKINS,
  PresetSkin
} from '../../../share/plugins/constants';

const DEFAULT_CUSTOM_COLOR = '#F759AB'; // 默认自定义颜色为粉色

// 当前皮肤状态
const currentSkin = ref<string>(DEFAULT_SKIN);
// 修改这里，默认粉色
const customColor = ref<string>(DEFAULT_CUSTOM_COLOR);

// 初始化皮肤
export function initSkin() {
  // 从localStorage获取保存的皮肤设置
  const savedSkin = localStorage.getItem(SKIN_STORAGE_KEY);

  if (savedSkin && Object.keys(PRESET_SKINS).includes(savedSkin)) {
    currentSkin.value = savedSkin;
    customColor.value = DEFAULT_CUSTOM_COLOR;
    applySkin(currentSkin.value);
  } else if (savedSkin) {
    // 自定义颜色
    currentSkin.value = 'custom';
    customColor.value = savedSkin || DEFAULT_CUSTOM_COLOR;
    applySkin('custom', customColor.value);
  } else {
    currentSkin.value = DEFAULT_SKIN;
    customColor.value = DEFAULT_CUSTOM_COLOR;
    applySkin(DEFAULT_SKIN);
  }
}

// 应用皮肤
export function applySkin(skin: string, color?: string) {
  // 更新当前皮肤状态
  currentSkin.value = skin;
  
  // 保存到localStorage
  if (skin === 'custom' && color) {
    localStorage.setItem(SKIN_STORAGE_KEY, color);
    customColor.value = color;
  } else {
    localStorage.setItem(SKIN_STORAGE_KEY, skin);
  }
  
  // 获取实际应用的颜色
  const skinColor = skin === 'custom' && color 
    ? color 
    : PRESET_SKINS[skin as PresetSkin];
  
  // 更新CSS变量
  updateCssVariables(skinColor);
}

// 更新CSS变量
function updateCssVariables(color: string) {
  const root = document.documentElement;

  // 计算衍生颜色
  const lighterColor = lightenColor(color, 0.2);
  const darkerColor = darkenColor(color, 0.1);

  // 设置CSS变量
  root.style.setProperty('--primary-color', color);
  root.style.setProperty('--primary-light-color', lighterColor);
  root.style.setProperty('--primary-dark-color', darkerColor);
}

// 颜色工具函数
function lightenColor(hex: string, percent: number): string {
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  
  r = Math.min(255, Math.floor(r + (255 - r) * percent));
  g = Math.min(255, Math.floor(g + (255 - g) * percent));
  b = Math.min(255, Math.floor(b + (255 - b) * percent));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

function darkenColor(hex: string, percent: number): string {
  let r = parseInt(hex.substring(1, 3), 16);
  let g = parseInt(hex.substring(3, 5), 16);
  let b = parseInt(hex.substring(5, 7), 16);
  
  r = Math.max(0, Math.floor(r * (1 - percent)));
  g = Math.max(0, Math.floor(g * (1 - percent)));
  b = Math.max(0, Math.floor(b * (1 - percent)));
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// 获取当前皮肤
export function getSkin(): string {
  return currentSkin.value;
}

// 获取自定义颜色
export function getCustomColor(): string {
  return customColor.value;
}

// 设置皮肤
export function setSkin(skin: string, color?: string, fromIpc = false) {
  applySkin(skin, color);
  // 强制刷新变量
  if (skin === 'custom' && color) {
    updateCssVariables(color);
  }
  // 只有不是IPC广播时才通知主进程
  if (!fromIpc && window.electron) {
    window.electron.ipcRenderer.send('settings-changed', { type: 'skin', value: skin, color });
  }
}