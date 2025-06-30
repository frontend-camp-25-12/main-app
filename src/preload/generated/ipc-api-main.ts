import type { PluginEnterAction } from '../../share/plugins/api.type.d';
import type { HotkeyOption } from '../../share/plugins/hotkeys.type.d';
import type { PluginRuntimeInfo, PluginMetadata, MatchRange, SearchResult, AppConfigSchema, PluginUsageInfoSchema, User } from '../../share/plugins/type.d';
import { electronAPI } from '@electron-toolkit/preload';

// 自动生成的IPC接口，请勿手动修改
export class IpcApi {
  /**
   * 添加插件
    * @param dir 插件目录，允许绝对路径和相对路径
   */
  async pluginDevInstall(dir: string): Promise<Record<string, PluginMetadata>> {
    return electronAPI.ipcRenderer.invoke('plugin-dev-install', dir);
  }

  /**
   * 获取插件列表
   */
  async pluginList(): Promise<Record<string, PluginMetadata>> {
    return electronAPI.ipcRenderer.invoke('plugin-list');
  }

  /**
   * 获取插件列表(按最近使用优先)
   */
  async pluginListRecent(): Promise<PluginMetadata[]> {
    return electronAPI.ipcRenderer.invoke('plugin-list-recent');
  }

  /**
   * 打开插件
    * @param id 插件id
    * @param action PluginEnterAction
   */
  async pluginOpen(id: string, action: PluginEnterAction): Promise<void> {
    return electronAPI.ipcRenderer.invoke('plugin-open', id, action);
  }

  /**
   * 搜索插件
    * @param query 搜索关键词
   */
  async pluginSearch(query: string): Promise<SearchResult[]> {
    return electronAPI.ipcRenderer.invoke('plugin-search', query);
  }

  /**
   * 获得所有插件的logo
   */
  async pluginLogos(): Promise<Record<string, string>> {
    return electronAPI.ipcRenderer.invoke('plugin-logos');
  }

  /**
   * 停用插件
    * @param id 插件ID
   */
  async pluginDisable(id: string): Promise<void> {
    return electronAPI.ipcRenderer.invoke('plugin-disable', id);
  }

  /**
   * 启用插件
    * @param id 插件ID
   */
  async pluginEnable(id: string): Promise<void> {
    return electronAPI.ipcRenderer.invoke('plugin-enable', id);
  }

  /**
   * 卸载插件
    * @param id 插件ID
   */
  async pluginRemove(id: string): Promise<void> {
    return electronAPI.ipcRenderer.invoke('plugin-remove', id);
  }

  /**
   * 切换深浅色模式
   */
  async toggleColorMode(): Promise<'light' | 'dark' | 'system'> {
    return electronAPI.ipcRenderer.invoke('toggle-color-mode');
  }

  /**
   * 获取应用配置项
    * @param key 配置项key
    * @param defalut 默认值
   */
  async appConfigGet<K extends keyof AppConfigSchema>(key: K, defalut: AppConfigSchema[K]): Promise<AppConfigSchema[K]> {
    return electronAPI.ipcRenderer.invoke('app-config-get', key, defalut);
  }

  /**
   * 设置主题模式
   */
  async setColorMode(mode: 'light' | 'dark' | 'system'): Promise<void> {
    return electronAPI.ipcRenderer.invoke('set-color-mode', mode);
  }

  /**
   * 设置应用内设置项
   */
  async appConfigSet<K extends keyof AppConfigSchema>(key: K, value: AppConfigSchema[K]): Promise<void> {
    return electronAPI.ipcRenderer.invoke('app-config-set', key, value);
  }

  /**
   * 由设置界面调用，告知其它窗口需要重新获取ui相关的配置项
   */
  async requireUiConfigReload<K extends keyof AppConfigSchema>(key: K, value: AppConfigSchema[K]): Promise<void> {
    return electronAPI.ipcRenderer.invoke('require-ui-config-reload', key, value);
  }

  /**
   * 获取所有可注册的快捷键列表
   */
  async listHotkeyOptions(): Promise<HotkeyOption[]> {
    return electronAPI.ipcRenderer.invoke('list-hotkey-options');
  }

  /**
   * 设置快捷键绑定
   */
  async updateHotkeyBinding(id: string, code: string, hotkey: string): Promise<void> {
    return electronAPI.ipcRenderer.invoke('update-hotkey-binding', id, code, hotkey);
  }

  /**
   * 获取当前颜色模式
   */
  async getColorMode(): Promise<AppConfigSchema['colorMode']> {
    return electronAPI.ipcRenderer.invoke('get-color-mode');
  }

  /**
   * 发起用户登录
    * @param username 用户名
    * @param password 密码
   */
  async userLogin(username: string, password: string): Promise<boolean> {
    return electronAPI.ipcRenderer.invoke('user-login', username, password);
  }

  /**
   * 发起用户注册
    * @param username 用户名
    * @param password 密码
   */
  async userRegister(username: string, password: string): Promise<boolean> {
    return electronAPI.ipcRenderer.invoke('user-register', username, password);
  }

  /**
   * 用户登出
   */
  async userLogout(): Promise<void> {
    return electronAPI.ipcRenderer.invoke('user-logout');
  }

  /**
   * 用户获取个人信息
   */
  async userInfo(): Promise<User | undefined> {
    return electronAPI.ipcRenderer.invoke('user-info');
  }

  /**
   * 广播需要更改界面的配置项变更事件
   */
  onUiConfigChange<K extends keyof AppConfigSchema>(callback: (key: K, value: AppConfigSchema[K]) => void) {
    electronAPI.ipcRenderer.on('ui-config-change', (_event, key, value) => callback(key, value));
  }

  /**
   * 广播需要刷新插件列表的事件
   */
  onPluginListChange(callback: () => void) {
    electronAPI.ipcRenderer.on('plugin-list-change', (_event) => callback());
  }
}

export const ipcApi = new IpcApi();
