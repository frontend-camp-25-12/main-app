// 自动生成的IPC接口，请勿手动修改
import { app, ipcMain } from 'electron';
import { serviceInstance } from '../ipc-service-main';
import { windowManager } from '../plugins/window';
import type { PluginEnterAction } from '../../share/plugins/api.type.d';
import type { HotkeyOption } from '../../share/plugins/hotkeys.type.d';
import type { PluginRuntimeInfo, PluginMetadata, MatchRange, SearchResult, AppConfigSchema, PluginUsageInfoSchema, User } from '../../share/plugins/type.d';
    
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


  // onSetColorMode(mode: 'light' | 'dark' | 'system') -> Promise<void>
  ipcMain.handle('set-color-mode', async (_event, mode: 'light' | 'dark' | 'system') => {
    return await serviceInstance.onSetColorMode(mode);
  });


  // onAppConfigSet<K extends keyof AppConfigSchema>(key: K, value: AppConfigSchema[K]) -> Promise<void>
  ipcMain.handle('app-config-set', async <K extends keyof AppConfigSchema>(_event, key: K, value: AppConfigSchema[K]) => {
    return await serviceInstance.onAppConfigSet(key, value);
  });


  // onRequireUiConfigReload<K extends keyof AppConfigSchema>(key: K, value: AppConfigSchema[K]) -> Promise<void>
  ipcMain.handle('require-ui-config-reload', async <K extends keyof AppConfigSchema>(_event, key: K, value: AppConfigSchema[K]) => {
    return await serviceInstance.onRequireUiConfigReload(key, value);
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


  // onUserLogin(username: string, password: string) -> Promise<boolean>
  ipcMain.handle('user-login', async (_event, username: string, password: string) => {
    return await serviceInstance.onUserLogin(username, password);
  });


  // onUserRegister(username: string, password: string) -> Promise<boolean>
  ipcMain.handle('user-register', async (_event, username: string, password: string) => {
    return await serviceInstance.onUserRegister(username, password);
  });


  // onUserLogout() -> Promise<void>
  ipcMain.handle('user-logout', async (_event, ) => {
    return await serviceInstance.onUserLogout();
  });


  // onUserInfo() -> Promise<User | undefined>
  ipcMain.handle('user-info', async (_event, ) => {
    return await serviceInstance.onUserInfo();
  });
});
    
export namespace ipcEmit {
  /**
  * 广播需要更改界面的配置项变更事件
  */
  export function uiConfigChange<K extends keyof AppConfigSchema>(key: K, value: AppConfigSchema[K]) {
    windowManager.emit('ui-config-change', key, value);
  }

  /**
  * 广播需要更改界面的配置项变更事件
  */
  export function uiConfigChangeTo<K extends keyof AppConfigSchema>(id: PluginMetadata['id'], key: K, value: AppConfigSchema[K]) {
    windowManager.emitTo(id, 'ui-config-change', key, value);
  }

  /**
  * 广播需要刷新插件列表的事件
  */
  export function pluginListChange() {
    windowManager.emit('plugin-list-change');
  }

  /**
  * 广播需要刷新插件列表的事件
  */
  export function pluginListChangeTo(id: PluginMetadata['id'], ) {
    windowManager.emitTo(id, 'plugin-list-change');
  }
}