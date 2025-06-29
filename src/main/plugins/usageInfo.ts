import { PluginMetadata } from "../../share/plugins/type";
import { PluginUsageInfoSchema, PluginUsageInfo } from "../config/pluginInfo";

class PluginUsageInfoManager {
  private info: Map<PluginMetadata['id'], PluginUsageInfoSchema['info'][number]> = new Map();
  private recentlyOrder: PluginMetadata['id'][] | undefined;
  constructor() {
    for (const info of PluginUsageInfo.get('info', [])) {
      this.info.set(info.id, info);
    }
  }

  add(plugin: PluginMetadata) {
    if (this.info.has(plugin.id) === false) {
      const newInfo: PluginUsageInfoSchema['info'][number] = {
        id: plugin.id,
        installedAt: Date.now(),
        usedAt: 0,
      };
      this.info.set(plugin.id, newInfo);
      this.saveState();
    }
  }

  onOpen(pluginId: PluginMetadata['id']) {
    const info = this.info.get(pluginId);
    if (info) {
      info.usedAt = Date.now();
      this.info.set(pluginId, info);
      this.saveState();
      this.recentlyOrder = undefined; // 清空最近使用顺序
    }
  }

  private saveState() {
    PluginUsageInfo.set('info', Array.from(this.info.values()));
  }

  getRecentlyOrder() {
    if (!this.recentlyOrder) {
      this.recentlyOrder = Array.from(this.info.values()).sort((a, b) => b.usedAt - a.usedAt).map(info => info.id);
    }
    return this.recentlyOrder;
  }
}

export const pluginUsageInfoManager = new PluginUsageInfoManager();