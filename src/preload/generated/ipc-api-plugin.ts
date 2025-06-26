import { electronAPI } from '@electron-toolkit/preload';

// 自动生成的IPC接口，请勿手动修改
export class PlatformApi {
  pluginId: string;
  constructor(pluginId: string) {
    this.pluginId = pluginId;
  }
  /**
    * 简单的hello方法，用于测试
    * @param id 插件id
    * @param content 内容
    */
  async hello(content: string): Promise<void> {
    return electronAPI.ipcRenderer.invoke('hello', this.pluginId, content);
  }

  /**
    * 获取插件配置项
    * @param id 插件id
    * @param key 配置项key
    * @param defalut 默认值
    */
  async configGet(key: string, defalut: string): Promise<string> {
    return electronAPI.ipcRenderer.invoke('config-get', this.pluginId, key, defalut);
  }

  /**
    * 设置插件配置项
    * @param id 插件id
    * @param key 配置项key
    * @param value 配置项值
    */
  async configSet(key: string, value: string): Promise<void> {
    return electronAPI.ipcRenderer.invoke('config-set', this.pluginId, key, value);
  }

  /**
   * 插件进入事件
    * @param action 包含code（在你的plugin.json中定义）和payload（用户输入）
   */
  onPluginEnter(callback: (action: {
    code: string;
    payload: string;
  }) => void) {
    electronAPI.ipcRenderer.on('plugin-enter', (_event, action) => callback(action));
  }
}
