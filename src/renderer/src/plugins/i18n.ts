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
export function setLocale(lang: string) {
  i18n.global.locale.value = lang;
  localStorage.setItem(LANG_STORAGE_KEY, lang);
  
  // 通知主进程语言已变更
  if (window.electron) {
    window.electron.ipcRenderer.send('language-changed', lang);
  }
}

// 获取当前语言
export function getLocale(): string {
  return i18n.global.locale.value;
}

export const t = i18n.global.t;

export default i18n;