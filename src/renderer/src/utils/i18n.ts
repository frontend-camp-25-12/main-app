import { createI18n } from 'vue-i18n';
import en from '../locales/en.json';
import zhCN from '../locales/zh-CN.json';
import { DEFAULT_LANGUAGE, LANG_STORAGE_KEY } from './constants';

// 从localStorage获取保存的语言设置
const savedLanguage = localStorage.getItem(LANG_STORAGE_KEY) as string | null;

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage || DEFAULT_LANGUAGE,
  fallbackLocale: DEFAULT_LANGUAGE,
  messages: {
    en,
    'zh-CN': zhCN
  }
});

// 切换语言方法
export function setLocale(lang: string, fromIpc = false) {
  i18n.global.locale.value = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);

  // 只有不是IPC广播时才通知主进程
  if (!fromIpc && window.electron) {
    window.electron.ipcRenderer.send('settings-changed', { type: 'language', value: lang });
  }
}

// 获取当前语言
export function getLocale(): string {
  return i18n.global.locale.value;
}

export const t = i18n.global.t;

export default {
  zh: {
    // ...其它翻译...
    background: '背景',
    applyBackground: '应用背景',
    remove: '移除'
  },
  en: {
    // ...其它翻译...
    background: 'Background',
    applyBackground: 'Apply Background',
    remove: 'Remove'
  }
}