import { computed, ComputedRef } from "vue";
import { MatchRange, PluginMetadata, SearchResult } from "../../../../../share/plugins/type";
import { getLocale } from "../../../utils/i18n";

export class PluginView {
  name: string | ComputedRef<string>; // 插件名称
  description?: string | ComputedRef<string>; // 插件描述
  id: string; // 插件ID
  logoPath?: string; // 插件logo路径

  // --- 当被搜索到时
  matchedName?: MatchRange;
  matchedDescription?: MatchRange;
  feature?: {  // 当被搜索时
    code: string; // 功能代码
    label: string; // 功能标签
    labelMatch?: MatchRange; // 功能标签匹配范围
  }

  constructor(plugin: PluginMetadata) {
    this.name = plugin.name;
    this.description = plugin.description;
    if (plugin.i18n) {
      this.name = computed(() => {
        return plugin.i18n![getLocale()]?.name || plugin.name;
      })
      this.description = computed(() => {
        return plugin.i18n![getLocale()]?.description || plugin.description;
      });
    }
    this.id = plugin.id;
    this.logoPath = plugin.logoPath;
  }

  static fromSearchResult(pluginList: PluginMetadata[], search: SearchResult[]): PluginView[] {
    const results: PluginView[] = [];
    const pluginMap: Map<PluginMetadata['id'], PluginMetadata> = new Map();
    for (const plugin of pluginList) {
      pluginMap.set(plugin.id, plugin);
    }
    for (const s of search) {
      const plugin = pluginMap.get(s.id);
      if (plugin) {

        const view = new PluginView(plugin);
        view.matchedName = s.name;
        view.matchedDescription = s.description;
        if (s.feature && s.feature.length > 0) {
          for (const feat of s.feature) {
            results.push({
              ...view,
              feature: {
                code: feat.code,
                label: feat.label,
                labelMatch: feat.labelMatch
              }
            });
          }
        } else {
          results.push(view);
        }
      }
    }
    return results;
  }
}