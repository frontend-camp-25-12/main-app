import type { PluginEnterAction, PluginMetadata, SearchResult } from '../share/plugins/type';
import { pluginManager } from './plugins/loader';
import { pluginSearch } from './plugins/search';
/**
 * 插件服务类
 * 在这里定义的on开头方法，将自动生成ipcMain.handle和ipcRenderer.invoke方法
 * emit开头的方法，将自动生成ipcMain.emit和ipcRenderer.on方法包装，生成两个方法：向所有插件广播，和向指定插件发送的版本
 */
export class IpcService {
  /**
 * 添加插件
 */
  async onPluginDevInstall(dir: string): Promise<Record<string, PluginMetadata>> {
    return pluginManager.installDevPlugin(dir);
  }

  /**
   * 获取插件列表
   */
  async onPluginList(): Promise<Record<string, PluginMetadata>> {
    return pluginManager.list();
  }

  /**
   * 打开插件
   */
  async onPluginOpen(id: string, action: PluginEnterAction): Promise<void> {
    return pluginManager.open(id, action);
  }

  /**
   * 搜索插件
   */
  async onPluginSearch(query: string): Promise<SearchResult[]> {
    return pluginSearch.search(query);
  }
}

export const serviceInstance = new IpcService();
