import { electronAPI } from '@electron-toolkit/preload';

// 自动生成的IPC接口，请勿手动修改
export class PlatformApi {
  /**
   * hello
   * Channel: hello
   */
  async hello(content: string): Promise<void> {
    return electronAPI.ipcRenderer.invoke('hello', content);
  }
}

export const platform = new PlatformApi();
