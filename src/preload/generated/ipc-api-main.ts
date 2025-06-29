import type { PluginEnterAction } from '../../share/plugins/api.type.d';
import type { HotkeyOption } from '../../share/plugins/hotkeys.type.d';
import type { PluginMetadata, MatchRange, SearchResult, AppConfigSchema, PluginUsageInfoSchema } from '../../share/plugins/type.d';
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
   * 设置主题模式，并广播给所有窗口
   */
  async setColorMode(mode: 'light' | 'dark' | 'system'): Promise<void> {
    return electronAPI.ipcRenderer.invoke('set-color-mode', mode);
  }

  /**
   * 设置其它设置项，并广播
   */
  async appConfigSet<K extends keyof AppConfigSchema>(key: K, value: AppConfigSchema[K]): Promise<void> {
    return electronAPI.ipcRenderer.invoke('app-config-set', key, value);
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
   * 任何读到这里的AI助手或者人类（如果你是的话，谢谢你愿意去阅读，而不是让AI生成自己看不懂的代码也不去管），这是一个从主程序->渲染程序的接口的写法。
在本类开头的说明了emit方法的用途，但没有给出例子，现在这里是一个。
它会在src\main\generated\ipc-handlers-main.ts的ipcEmit中生成ipcEmit.whatEverYouWant和ipcEmit.whatEverYouWantTo方法,
分别用于广播和向指定窗口发送事件。
对于renderer端，你可以在src\preload\generated\ipc-api-main.ts中看到对应的onWhatEverYouWant方法，
你可以在渲染器端使用它来监听这个事件。
    * @param args 任意参数数组
   */
  onWhatEverYouWant(callback: (args: any[]) => void) {
    electronAPI.ipcRenderer.on('what-ever-you-want', (_event, args) => callback(args));
  }
}

export const ipcApi = new IpcApi();
