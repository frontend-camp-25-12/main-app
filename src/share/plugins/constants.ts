export const DEFAULT_LANGUAGE = 'zh-CN';
export const SUPPORTED_LANGUAGES = ['zh-CN', 'en'] as const;
export type Language = typeof SUPPORTED_LANGUAGES[number];

export const LANG_STORAGE_KEY = 'app_language';

export const THEME_STORAGE_KEY = 'app_theme';
export const DEFAULT_THEME = 'system';
export const SUPPORTED_THEMES = ['light', 'dark', 'system'] as const;
export type Theme = typeof SUPPORTED_THEMES[number];