import { app, ipcMain } from 'electron';
import { serviceInstance } from '../plugins/ipc-service-plugin';
app.on('ready', () => {
  // onHello(content: string) -> Promise<void>
  ipcMain.handle('hello', async (_event, content: string) => {
    return await serviceInstance.onHello(content);
  });
});
    
export namespace ipcEmitPlugin {

}