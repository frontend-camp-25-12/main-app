import { createI18n } from 'vue-i18n';
import en from '../locales/en.json';
import zhCN from '../locales/zh-CN.json';
import { DEFAULT_LANGUAGE } from './constants';

const savedLanguage = await window.ipcApi.appConfigGet('locale', 'zh-CN')

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
export function setLocale(lang: typeof savedLanguage) {
  handleLanguageChange(lang);
  window.ipcApi.appConfigSet('locale', lang)
  window.ipcApi.requireUiConfigReload('locale', lang);
}

export function handleLanguageChange(lang: typeof savedLanguage) {
  if (i18n.global.locale.value !== lang) {
    i18n.global.locale.value = lang;
  }
}

// 获取当前语言
export function getLocale(): string {
  return i18n.global.locale.value;
}

export const t = i18n.global.t;

export default i18n;