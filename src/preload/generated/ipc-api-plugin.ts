import { electronAPI } from '@electron-toolkit/preload';
import type { PluginEnterAction } from '../../share/plugins/api.type.d';

// 自动生成的IPC接口，请勿手动修改
export class PlatformApi {
  pluginId: string;
  constructor(pluginId: string) {
    this.pluginId = pluginId;
  }
  /**
    * 简单的hello方法，用于测试
    * @param content 内容 
    */
  async hello(content: string): Promise<void> {
    return electronAPI.ipcRenderer.invoke('hello', this.pluginId, content);
  }

  /**
    * 获取插件配置项
    * @param key 配置项key
    * @param defalut 默认值 
    */
  async configGet(key: string, defalut: any): Promise<any> {
    return electronAPI.ipcRenderer.invoke('config-get', this.pluginId, key, defalut);
  }

  /**
    * 设置插件配置项
    * @param key 配置项key
    * @param value 配置项值 
    */
  async configSet(key: string, value: any): Promise<void> {
    return electronAPI.ipcRenderer.invoke('config-set', this.pluginId, key, value);
  }

  /**
    * 打开快捷键设置页面
    * @param code 要跳转到的希望用户设置快捷键的功能代码 
    */
  async openHotkeySettings(code: string): Promise<void> {
    return electronAPI.ipcRenderer.invoke('open-hotkey-settings', this.pluginId, code);
  }

  /**
    * 获得上一次enter事件的action，可避免插件中onPluginEnter没有及时监听导致错过action的情况。 
    */
  async getLastPluginEnterAction(): Promise<PluginEnterAction | undefined> {
    return electronAPI.ipcRenderer.invoke('get-last-plugin-enter-action', this.pluginId);
  }

  /**
    * 插件主动退出 
    */
  async closeSelf(): Promise<void> {
    return electronAPI.ipcRenderer.invoke('close-self', this.pluginId);
  }

  /**
    * 获取当前本地化偏好 
    */
  async getLocalePreference(): Promise<string> {
    return electronAPI.ipcRenderer.invoke('get-locale-preference', this.pluginId);
  }

  /**
   * 插件进入事件
    * @param action PluginEnterAction
   */
  onPluginEnter(callback: (action: PluginEnterAction) => void) {
    electronAPI.ipcRenderer.on('plugin-enter', (_event, action) => callback(action));
  }

  /**
   * 语言变更事件
   */
  onLocalePreferenceChange(callback: (language: string) => void) {
    electronAPI.ipcRenderer.on('locale-preference-change', (_event, language) => callback(language));
  }
}
