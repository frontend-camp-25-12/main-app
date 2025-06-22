import i18next from "i18next";
import en from "./en.json";
import zh from "./zh-CN.json";

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
  lng: "zh-CN",
  fallbackLng: "en",
  defaultNS: defaultNS,
  resources: resources,
});

export default i18next;