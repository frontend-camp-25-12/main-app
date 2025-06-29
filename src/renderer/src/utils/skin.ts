import { ref, watch } from 'vue';
import { 
  SKIN_STORAGE_KEY, 
  DEFAULT_SKIN,
  PRESET_SKINS,
  PresetSkin
} from '../../../share/plugins/constants';

const DEFAULT_CUSTOM_COLOR = '#C62424'; // 默认自定义颜色为粉色

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
  if (skin === 'custom' && color) {
    updateCssVariables(color);
    currentSkin.value = 'custom';
    customColor.value = color;
  } else {
    updateCssVariables(PRESET_SKINS[skin] || DEFAULT_CUSTOM_COLOR);
    currentSkin.value = skin;
    customColor.value = DEFAULT_CUSTOM_COLOR;
  }
}

// 更新CSS变量
function updateCssVariables(color: string) {
  const root = document.documentElement;
  root.style.setProperty('--primary-color', color);
  root.style.setProperty('--accent-color', color); // 你可以用不同算法生成不同色
  root.style.setProperty('--title-color', color);  // 你可以用不同算法生成不同色
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
  if (skin === 'custom' && color) {
    updateCssVariables(color);
  }
  // 不再本地广播，由主进程统一广播
}