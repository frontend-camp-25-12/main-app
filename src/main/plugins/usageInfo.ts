import { PluginMetadata, PluginUsageInfoSchema } from "../../share/plugins/type";
import { PluginUsageInfo } from "../config/pluginInfo";

/**
 * 管理将会被用store记录的插件使用信息。
 * 可以视作PluginManager的内部类，某些操作（如add）会产生修改PluginManager的状态的副作用。
 * 仅为了代码清晰，拆分到这里。
 */
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
        disabled: false
      };
      this.info.set(plugin.id, newInfo);
      this.saveState();
    }
    const info = this.info.get(plugin.id)!;
    plugin.installedAt = info.installedAt ?? Date.now();
    plugin.usedAt = info.usedAt ?? 0;
    plugin.disabled = info.disabled ?? false;
  }

  onOpen(plugin: PluginMetadata) {
    const info = this.info.get(plugin.id);
    if (info) {
      info.usedAt = Date.now();
      this.info.set(plugin.id, info);
      this.saveState();
      plugin.usedAt = info.usedAt;
    }
  }

  disable(plugin: PluginMetadata) {
    plugin.disabled = true;
    
    const info = this.info.get(plugin.id);
    if (info) {
      info.disabled = true;
      this.info.set(plugin.id, info);
      this.saveState();
    }
  }

  enable(plugin: PluginMetadata) {
    plugin.disabled = false;

    const info = this.info.get(plugin.id);
    if (info) {
      info.disabled = false;
      this.info.set(plugin.id, info);
      this.saveState();
    }
  }

  remove(pluginId: PluginMetadata['id']) {
    if (this.info.has(pluginId)) {
      this.info.delete(pluginId);
      this.saveState();
    }
  }

  private saveState() {
    PluginUsageInfo.set('info', Array.from(this.info.values()));
    this.recentlyOrder = undefined; // 清空最近使用顺序
  }

  getRecentlyOrder() {
    if (!this.recentlyOrder) {
      this.recentlyOrder = Array.from(this.info.values()).sort((a, b) => b.usedAt - a.usedAt).map(info => info.id);
    }
    return this.recentlyOrder;
  }
}

export const pluginUsageInfoManager = new PluginUsageInfoManager();