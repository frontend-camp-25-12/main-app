import { AppConfigSchema } from "../../../share/plugins/type"
import { handleLanguageChange } from "./i18n"
import { handleThemeColorChange } from "./themeColor"

export const handles: ((key: string, value: any) => void)[] = []
/**
 * 当修改了需要刷新ui的配置时，调用对应的处理函数
 */
window.ipcApi.onUiConfigChange((key, value) => {
  if (key === 'locale') {
    handleLanguageChange(value as AppConfigSchema['locale'])
  } else if (key === 'themeColor') {
    handleThemeColorChange(value as AppConfigSchema['themeColor'])
  } else {
    handles.forEach(handle => handle(key, value))
  }
})