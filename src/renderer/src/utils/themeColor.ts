
/**
 * 将rgb()或rgba()格式的颜色字符串转换为--el-color-primary-rgb需要的red, green, blue格式。
 * @param color 
 */
function parseRgbOrRgba(color: string): string {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (match) {
    const [, red, green, blue] = match;
    return `${red}, ${green}, ${blue}`;
  }
  return '';
}

export const themeColorDefault = '#409eff';
/**
 * 应用新的主题色，并使用 CSS color-mix() 自动生成衍生颜色进行覆盖。
 * @param primaryColor - 新的主题色，rgb() rgba() 格式
 * @param styleId - 注入的 style 标签的 ID，用于更新或移除。
 */
export function handleThemeColorChange(primaryColor: string, styleId: string = 'el-theme-color-override'): void {
  if (!primaryColor || primaryColor == '' || primaryColor == themeColorDefault) {
    let styleElement = document.getElementById(styleId);
    if (styleElement) {
      styleElement.remove();
      return;
    }
  }
  const rgbColor = parseRgbOrRgba(primaryColor);
  const css = `
    :root {
      --el-color-primary-rgb: ${rgbColor} !important;
      --el-color-primary: ${primaryColor} !important;
      --el-color-primary-light-3: color-mix(in srgb, white 30%, ${primaryColor}) !important;
      --el-color-primary-light-5: color-mix(in srgb, white 50%, ${primaryColor}) !important;
      --el-color-primary-light-7: color-mix(in srgb, white 70%, ${primaryColor}) !important;
      --el-color-primary-light-8: color-mix(in srgb, white 80%, ${primaryColor}) !important;
      --el-color-primary-light-9: color-mix(in srgb, white 90%, ${primaryColor}) !important;
      --el-color-primary-dark-2: color-mix(in srgb, black 20%, ${primaryColor}) !important;
    }
  `.trim();

  let styleElement = document.getElementById(styleId);
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = styleId;
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = css;
}

export function setThemeColor(color: string): void {
  handleThemeColorChange(color);
  window.ipcApi.appConfigSet('themeColor', color);
  window.ipcApi.requireUiConfigReload('themeColor', color);
}

handleThemeColorChange(await window.ipcApi.appConfigGet('themeColor', '#409eff'))