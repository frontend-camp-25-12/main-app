import { app, ipcMain } from 'electron';
import { serviceInstance } from '../plugins/ipc-service-plugin';
import { windowManager } from '../plugins/window';
import type { PluginEnterAction } from '../../share/plugins/api.type.d';
import type { HotkeyOption } from '../../share/plugins/hotkeys.type.d';
import type { PluginMetadata, MatchRange, SearchResult } from '../../share/plugins/type.d';
app.on('ready', () => {

  // onHello(id: string, content: string) -> Promise<void>
  ipcMain.handle('hello', async (_event, id: string, content: string) => {
    return await serviceInstance.onHello(id, content);
  });


  // onConfigGet(id: string, key: string, defalut: string) -> Promise<string>
  ipcMain.handle('config-get', async (_event, id: string, key: string, defalut: string) => {
    return await serviceInstance.onConfigGet(id, key, defalut);
  });


  // onConfigSet(id: string, key: string, value: string) -> Promise<void>
  ipcMain.handle('config-set', async (_event, id: string, key: string, value: string) => {
    return await serviceInstance.onConfigSet(id, key, value);
  });
});
    
export namespace ipcEmitPlugin {
  /**
  * 插件进入事件
    * @param action PluginEnterAction
  */
  export function pluginEnter(action: PluginEnterAction) {
    windowManager.emit('plugin-enter', action);
  }

  /**
  * 插件进入事件
    * @param action PluginEnterAction
  */
  export function pluginEnterTo(id: PluginMetadata['id'], action: PluginEnterAction) {
    windowManager.emitTo(id, 'plugin-enter', action);
  }
}