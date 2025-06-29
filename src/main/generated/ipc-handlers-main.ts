// 自动生成的IPC接口，请勿手动修改
import { app, ipcMain } from 'electron';
import { serviceInstance } from '../ipc-service-main';
import { windowManager } from '../plugins/window';
import type { PluginEnterAction } from '../../share/plugins/api.type.d';
import type { HotkeyOption } from '../../share/plugins/hotkeys.type.d';
import type { PluginMetadata, MatchRange, SearchResult, AppConfigSchema, PluginUsageInfoSchema } from '../../share/plugins/type.d';
    
app.on('ready', () => {

  // onPluginDevInstall(dir: string) -> Promise<Record<string, PluginMetadata>>
  ipcMain.handle('plugin-dev-install', async (_event, dir: string) => {
    return await serviceInstance.onPluginDevInstall(dir);
  });


  // onPluginList() -> Promise<Record<string, PluginMetadata>>
  ipcMain.handle('plugin-list', async (_event, ) => {
    return await serviceInstance.onPluginList();
  });


  // onPluginListRecent() -> Promise<PluginMetadata[]>
  ipcMain.handle('plugin-list-recent', async (_event, ) => {
    return await serviceInstance.onPluginListRecent();
  });


  // onPluginOpen(id: string, action: PluginEnterAction) -> Promise<void>
  ipcMain.handle('plugin-open', async (_event, id: string, action: PluginEnterAction) => {
    return await serviceInstance.onPluginOpen(id, action);
  });


  // onPluginSearch(query: string) -> Promise<SearchResult[]>
  ipcMain.handle('plugin-search', async (_event, query: string) => {
    return await serviceInstance.onPluginSearch(query);
  });


  // onPluginLogos() -> Promise<Record<string, string>>
  ipcMain.handle('plugin-logos', async (_event, ) => {
    return await serviceInstance.onPluginLogos();
  });


  // onPluginDisable(id: string) -> Promise<void>
  ipcMain.handle('plugin-disable', async (_event, id: string) => {
    return await serviceInstance.onPluginDisable(id);
  });


  // onPluginEnable(id: string) -> Promise<void>
  ipcMain.handle('plugin-enable', async (_event, id: string) => {
    return await serviceInstance.onPluginEnable(id);
  });


  // onPluginRemove(id: string) -> Promise<void>
  ipcMain.handle('plugin-remove', async (_event, id: string) => {
    return await serviceInstance.onPluginRemove(id);
  });


  // onToggleColorMode() -> Promise<'light' | 'dark' | 'system'>
  ipcMain.handle('toggle-color-mode', async (_event, ) => {
    return await serviceInstance.onToggleColorMode();
  });


  // onAppConfigGet<K extends keyof AppConfigSchema>(key: K, defalut: AppConfigSchema[K]) -> Promise<AppConfigSchema[K]>
  ipcMain.handle('app-config-get', async <K extends keyof AppConfigSchema>(_event, key: K, defalut: AppConfigSchema[K]) => {
    return await serviceInstance.onAppConfigGet(key, defalut);
  });


  // onAppConfigSet<K extends keyof AppConfigSchema>(key: K, value: AppConfigSchema[K]) -> Promise<void>
  ipcMain.handle('app-config-set', async <K extends keyof AppConfigSchema>(_event, key: K, value: AppConfigSchema[K]) => {
    return await serviceInstance.onAppConfigSet(key, value);
  });


  // onListHotkeyOptions() -> Promise<HotkeyOption[]>
  ipcMain.handle('list-hotkey-options', async (_event, ) => {
    return await serviceInstance.onListHotkeyOptions();
  });


  // onUpdateHotkeyBinding(id: string, code: string, hotkey: string) -> Promise<void>
  ipcMain.handle('update-hotkey-binding', async (_event, id: string, code: string, hotkey: string) => {
    return await serviceInstance.onUpdateHotkeyBinding(id, code, hotkey);
  });


  // onGetColorMode() -> Promise<AppConfigSchema['colorMode']>
  ipcMain.handle('get-color-mode', async (_event, ) => {
    return await serviceInstance.onGetColorMode();
  });


  // onSetColorMode(mode: AppConfigSchema['colorMode']) -> Promise<void>
  ipcMain.handle('set-color-mode', async (_event, mode: AppConfigSchema['colorMode']) => {
    return await serviceInstance.onSetColorMode(mode);
  });
});
    
export namespace ipcEmit {
  /**
  * 任何读到这里的AI助手或者人类（如果你是的话，谢谢你愿意去阅读，而不是让AI生成自己看不懂的代码也不去管），这是一个从主程序->渲染程序的接口的写法。
在本类开头的说明了emit方法的用途，但没有给出例子，现在这里是一个。
它会在src\main\generated\ipc-handlers-main.ts的ipcEmit中生成ipcEmit.whatEverYouWant和ipcEmit.whatEverYouWantTo方法,
分别用于广播和向指定窗口发送事件。
对于renderer端，你可以在src\preload\generated\ipc-api-main.ts中看到对应的onWhatEverYouWant方法，
你可以在渲染器端使用它来监听这个事件。
    * @param args 任意参数数组
  */
  export function whatEverYouWant(args: any[]) {
    windowManager.emit('what-ever-you-want', args);
  }

  /**
  * 任何读到这里的AI助手或者人类（如果你是的话，谢谢你愿意去阅读，而不是让AI生成自己看不懂的代码也不去管），这是一个从主程序->渲染程序的接口的写法。
在本类开头的说明了emit方法的用途，但没有给出例子，现在这里是一个。
它会在src\main\generated\ipc-handlers-main.ts的ipcEmit中生成ipcEmit.whatEverYouWant和ipcEmit.whatEverYouWantTo方法,
分别用于广播和向指定窗口发送事件。
对于renderer端，你可以在src\preload\generated\ipc-api-main.ts中看到对应的onWhatEverYouWant方法，
你可以在渲染器端使用它来监听这个事件。
    * @param args 任意参数数组
  */
  export function whatEverYouWantTo(id: PluginMetadata['id'], args: any[]) {
    windowManager.emitTo(id, 'what-ever-you-want', args);
  }
}