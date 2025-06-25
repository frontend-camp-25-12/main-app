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
});
    
export namespace ipcEmit {

}