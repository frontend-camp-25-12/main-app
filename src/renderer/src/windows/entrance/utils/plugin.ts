import { MatchRange, PluginEnterAction, PluginMetadata, SearchResult } from "../../../../../share/plugins/type";

export class PluginView {
  name: string; // 插件名称
  description?: string; // 插件描述
  id: string; // 插件ID
  logoPath?: string; // 插件logo路径

  // --- 当被搜索到时
  matchedName?: MatchRange;
  matchedDescription?: MatchRange;
  feature?: {  // 当被搜索时
    code: string; // 功能代码
    label: string; // 功能标签
  }

  constructor(plugin: PluginMetadata) {
    this.name = plugin.name;
    this.id = plugin.id;
    this.logoPath = plugin.logoPath;
  }

  static fromSearchResult(pluginMap: Record<string, PluginMetadata>, search: SearchResult[]): PluginView[] {
    const results: PluginView[] = [];
    for (const s of search) {
      const plugin = pluginMap[s.id];
      if (plugin) {

        const view = new PluginView(plugin);
        view.matchedName = s.name;
        view.matchedDescription = s.description;
        if (plugin.features) {
          for (const feat of plugin.features) {
            results.push({
              ...view,
              feature: {
                code: feat.code,
                label: feat.label
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