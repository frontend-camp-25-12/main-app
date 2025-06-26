import { app, ipcMain } from 'electron';
import { serviceInstance } from '../plugins/ipc-service-plugin';
import { windowManager } from '../plugins/window';
import { PluginMetadata } from '../../share/plugins/type';
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
    * @param action 包含code（在你的plugin.json中定义）和payload（用户输入）
  */
  export function pluginEnter(action: {
    code: string;
    payload: string;
  }) {
    windowManager.emit('plugin-enter', action);
  }

  /**
  * 插件进入事件
    * @param action 包含code（在你的plugin.json中定义）和payload（用户输入）
  */
  export function pluginEnterTo(id: PluginMetadata['id'], action: {
    code: string;
    payload: string;
  }) {
    windowManager.emitTo(id, 'plugin-enter', action);
  }
}