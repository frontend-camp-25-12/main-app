import type { PluginMetadata, SearchResult } from '../share/plugins/type';
import { pluginManager } from './plugins/loader';
import { pluginSearch } from './plugins/search';
/**
 * 插件服务类
 * 在这里定义的on开头的public方法会自动生成对应的IPC接口
 */
export class IpcService {
  /**
 * 添加插件
 */
  async onPluginAdd(dir: string): Promise<Record<string, PluginMetadata>> {
    return pluginManager.add(dir);
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
  async onPluginOpen(id: string): Promise<void> {
    return pluginManager.open(id);
  }

  /**
   * 搜索插件
   */
  async onPluginSearch(query: string): Promise<SearchResult[]> {
    return pluginSearch.search(query);
  }
}

export const serviceInstance = new IpcService();
