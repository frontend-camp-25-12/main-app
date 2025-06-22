export const DEFAULT_LANGUAGE = 'zh-CN';
export const SUPPORTED_LANGUAGES = ['zh-CN', 'en'] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];

export const LANG_STORAGE_KEY = 'app_language';