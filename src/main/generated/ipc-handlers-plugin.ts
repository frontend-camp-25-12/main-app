import { app, ipcMain } from 'electron';
import { serviceInstance } from '../plugins/ipc-service-plugin';
app.on('ready', () => {
  // onHello(id: string, content: string) -> Promise<void>
  ipcMain.handle('hello', async (_event, id: string, content: string) => {
    return await serviceInstance.onHello(id, content);
  });
});
    
export namespace ipcEmitPlugin {

}