import i18next from "i18next";
import en from "./en.json";
import zh from "./zh-CN.json";
import { updateTrayMenu } from "../tray";
import { AppConfig } from "../config/app";
import { hotkeyManager } from "../plugins/hotkeys";
import { windowManager } from "../plugins/window";

export const defaultNS = "translation";

export const resources = {
  en: {
    translation: en
  },
  "zh-CN": {
    translation: zh
  }
} as const;


i18next.init({
  lng: AppConfig.get("locale", "zh-CN"),
  fallbackLng: "en",
  defaultNS: defaultNS,
  resources: resources,
});

export default i18next;

export async function changeLanguage(lang: "en" | "zh-CN") {
  i18next.changeLanguage(lang);
  updateTrayMenu();
  await hotkeyManager.updateHotkeyLabelLocale(lang);
  windowManager.updateWindowTitleLocale(lang);
}