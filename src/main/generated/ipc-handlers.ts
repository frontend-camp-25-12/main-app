// 自动生成的IPC接口，请勿手动修改
import { app, ipcMain } from 'electron';
import { serviceInstance } from '../ipc-service';
import { windowManager } from '../plugins/window';


app.on('ready', () => {
  // onPluginAdd: dir: string -> Promise<Record<string, PluginMetadata>>
  ipcMain.handle('plugin-add', async (_event, dir) => {
    return await serviceInstance.onPluginAdd(dir);
  });

  // onPluginList:  -> Promise<Record<string, PluginMetadata>>
  ipcMain.handle('plugin-list', async (_event) => {
    return await serviceInstance.onPluginList();
  });

  // onPluginOpen: id: string -> Promise<void>
  ipcMain.handle('plugin-open', async (_event, id) => {
    return await serviceInstance.onPluginOpen(id);
  });

  // onPluginSearch: query: string -> Promise<SearchResult[]>
  ipcMain.handle('plugin-search', async (_event, query) => {
    return await serviceInstance.onPluginSearch(query);
  });
});

export namespace ipcEmit {
  function settingsChanged(test) {
    windowManager.emitInternal('settings-changed', test);                  
  }
}
