import { app, ipcMain } from 'electron';
import { serviceInstance } from '../plugins/ipc-service-plugin';
import { windowManager } from '../plugins/window';
import { PluginMetadata } from '../../share/plugins/type';
app.on('ready', () => {
  // onHello(id: string, content: string) -> Promise<void>
  ipcMain.handle('hello', async (_event, id: string, content: string) => {
    return await serviceInstance.onHello(id, content);
  });
});
    
export namespace ipcEmitPlugin {
  export function pluginEnter(action: {
    code: string;
    payload: string;
  }) {
  windowManager.emit('plugin-enter', action);
}

  export function pluginEnterTo(id: PluginMetadata['id'], action: {
    code: string;
    payload: string;
  }) {
    windowManager.emitTo(id, 'plugin-enter', action);
  }
}