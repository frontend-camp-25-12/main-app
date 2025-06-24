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
}
