// 自动生成的IPC接口，请勿手动修改
import { app, ipcMain } from 'electron';
import { serviceInstance } from '../ipc-service-main';
import { windowManager } from '../plugins/window';

import type { PluginMetadata, MatchRange, SearchResult, PluginEnterAction } from '../../share/plugins/type';
    
app.on('ready', () => {
  // onPluginDevInstall(dir: string) -> Promise<Record<string, PluginMetadata>>
  ipcMain.handle('plugin-dev-install', async (_event, dir: string) => {
    return await serviceInstance.onPluginDevInstall(dir);
  });

  // onPluginList() -> Promise<Record<string, PluginMetadata>>
  ipcMain.handle('plugin-list', async (_event, ) => {
    return await serviceInstance.onPluginList();
  });

  // onPluginOpen(id: string, action: PluginEnterAction) -> Promise<void>
  ipcMain.handle('plugin-open', async (_event, id: string, action: PluginEnterAction) => {
    return await serviceInstance.onPluginOpen(id, action);
  });

  // onPluginSearch(query: string) -> Promise<SearchResult[]>
  ipcMain.handle('plugin-search', async (_event, query: string) => {
    return await serviceInstance.onPluginSearch(query);
  });

  // onToggleColorMode() -> Promise<'light' | 'dark' | 'system'>
  ipcMain.handle('toggle-color-mode', async (_event, ) => {
    return await serviceInstance.onToggleColorMode();
  });

  // onAppConfigGet(key: string, defalut: string) -> Promise<string>
  ipcMain.handle('app-config-get', async (_event, key: string, defalut: string) => {
    return await serviceInstance.onAppConfigGet(key, defalut);
  });

  // onAppConfigSet(key: string, value: string) -> Promise<void>
  ipcMain.handle('app-config-set', async (_event, key: string, value: string) => {
    return await serviceInstance.onAppConfigSet(key, value);
  });
});
    
export namespace ipcEmit {
  export function whatEverYouWant(args: any[]) {
  windowManager.emit('what-ever-you-want', args);
}

  export function whatEverYouWantTo(id: PluginMetadata['id'], args: any[]) {
    windowManager.emitTo(id, 'what-ever-you-want', args);
  }
}