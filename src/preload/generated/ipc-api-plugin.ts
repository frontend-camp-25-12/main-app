import { electronAPI } from '@electron-toolkit/preload';

// 自动生成的IPC接口，请勿手动修改
export class PlatformApi {
  pluginId: string;
  constructor(pluginId: string) {
    this.pluginId = pluginId;
  }
  /**
    * hello
    * Channel: hello
    */
  async hello(content: string): Promise<void> {
    return electronAPI.ipcRenderer.invoke('hello', this.pluginId, content);
  }

  /**
    * configGet
    * Channel: config-get
    */
  async configGet(key: string, defalut: string): Promise<string> {
    return electronAPI.ipcRenderer.invoke('config-get', this.pluginId, key, defalut);
  }

  /**
    * configSet
    * Channel: config-set
    */
  async configSet(key: string, value: string): Promise<void> {
    return electronAPI.ipcRenderer.invoke('config-set', this.pluginId, key, value);
  }

  /**
   * onPluginEnter
   * Channel: plugin-enter
   */
  onPluginEnter(callback: (action: {
    code: string;
    payload: string;
  }) => void) {
    electronAPI.ipcRenderer.on('plugin-enter', (_event, action) => callback(action));
  }
}
