import { computed } from "vue";
import { getLocale } from "../../../utils/i18n";
import { PluginI18n } from "../types/plugin";



export function tPluginName(plugin: PluginI18n) {
  return plugin.i18n ? computed(() => {
    const ted = plugin.i18n?.[getLocale()];
    return ted ? ted.name : plugin.name;
  }) : plugin.name;
}

export function tPluginDescription(plugin: PluginI18n) {
  return plugin.i18n && plugin.i18n[getLocale()]?.description ? computed(() => {
    const ted = plugin.i18n?.[getLocale()];
    return ted ? ted.description : plugin.description;
  }) : plugin.description;
}