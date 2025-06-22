import { app } from 'electron'
import { LANG_STORAGE_KEY, DEFAULT_LANGUAGE } from '../../share/plugins/constants'

// 简单多语言对象
const messages = {
  en: {
    showHideMain: 'Show/Hide Main Window',
    openSettings: 'Settings',
    quit: 'Quit',
    appName: 'My Tools'
  },
  'zh-CN': {
    showHideMain: '显示/隐藏主窗口',
    openSettings: '设置',
    quit: '退出',
    appName: '我的工具'
  }
}

// 获取当前语言（可根据你的存储逻辑调整）
function getCurrentLanguage() {
  // 这里可以从配置文件、store等读取，或用系统语言
  return DEFAULT_LANGUAGE // 或 app.getLocale()
}

type MessageKeys = keyof typeof messages['en'];

export function t(key: MessageKeys) {
  const lang = getCurrentLanguage();
  return messages[lang]?.[key] || messages[DEFAULT_LANGUAGE][key] || key;
}