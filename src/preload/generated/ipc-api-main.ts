import { electronAPI } from '@electron-toolkit/preload';
import type { PluginMetadata, MatchRange, SearchResult, PluginEnterAction } from '../../share/plugins/type';

// 自动生成的IPC接口，请勿手动修改
export class IpcApi {
  /**
   * pluginDevInstall
   * Channel: plugin-dev-install
   */
  async pluginDevInstall(dir: string): Promise<Record<string, PluginMetadata>> {
    return electronAPI.ipcRenderer.invoke('plugin-dev-install', dir);
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
  async pluginOpen(id: string, action: PluginEnterAction): Promise<void> {
    return electronAPI.ipcRenderer.invoke('plugin-open', id, action);
  }

  /**
   * pluginSearch
   * Channel: plugin-search
   */
  async pluginSearch(query: string): Promise<SearchResult[]> {
    return electronAPI.ipcRenderer.invoke('plugin-search', query);
  }

  /**
   * toggleColorMode
   * Channel: toggle-color-mode
   */
  async toggleColorMode(): Promise<'light' | 'dark' | 'system'> {
    return electronAPI.ipcRenderer.invoke('toggle-color-mode');
  }

  /**
   * onWhatEverYouWant
   * Channel: what-ever-you-want
   */
  onWhatEverYouWant(callback: (args: any[]) => void) {
    electronAPI.ipcRenderer.on('what-ever-you-want', (_event, args) => callback(args));
  }
}

export const ipcApi = new IpcApi();
