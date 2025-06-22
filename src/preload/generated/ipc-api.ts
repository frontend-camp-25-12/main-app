import { electronAPI } from '@electron-toolkit/preload';
import type { PluginMetadata, SearchResult } from '../../share/plugins/type';

// 自动生成的IPC接口，请勿手动修改
export class IpcApi {
  /**
   * pluginAdd
   * Channel: plugin-add
   */
  async pluginAdd(dir: string): Promise<Record<string, PluginMetadata>> {
    return electronAPI.ipcRenderer.invoke('plugin-add', dir);
  }

  /**
   * pluginList
   * Channel: plugin-list
   */
  async pluginList(): Promise<Record<string, PluginMetadata>> {
    return electronAPI.ipcRenderer.invoke('plugin-list');
  }

  /**
   * pluginOpen
   * Channel: plugin-open
   */
  async pluginOpen(id: string): Promise<void> {
    return electronAPI.ipcRenderer.invoke('plugin-open', id);
  }

  /**
   * pluginSearch
   * Channel: plugin-search
   */
  async pluginSearch(query: string): Promise<SearchResult[]> {
    return electronAPI.ipcRenderer.invoke('plugin-search', query);
  }
}

export const ipcApi = new IpcApi();
