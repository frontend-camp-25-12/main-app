import type { PluginEnterAction, PluginMetadata, SearchResult } from '../share/plugins/type';
import { pluginManager } from './plugins/loader';
import { pluginSearch } from './plugins/search';
import { nativeTheme } from 'electron';
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

  /**
   * 切换深浅色模式
   */
  async onToggleColorMode(): Promise<'light' | 'dark' | 'system'> {
    // 切换 themeSource
    const current = nativeTheme.themeSource;
    let next: 'light' | 'dark' | 'system';
    if (current === 'light') next = 'dark';
    else if (current === 'dark') next = 'system';
    else next = 'light';
    nativeTheme.themeSource = next;
    return next;
  }
}

export const serviceInstance = new IpcService();
