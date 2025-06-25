import type { PluginEnterAction, PluginMetadata, SearchResult } from '../share/plugins/type';
import { AppConfig } from './config/service';
import { pluginManager } from './plugins/loader';
import { pluginSearch } from './plugins/search';
import { nativeTheme } from 'electron';
/**
 * 插件服务类
 * 在这里定义的on开头方法，将自动生成ipcMain.handle和ipcRenderer.invoke方法
 * emit开头的方法，将自动生成ipcMain.emit和ipcRenderer.on方法包装，生成两个方法：向所有插件广播，和向指定插件发送的版本
 */
export class IpcService {
  /**
 * 添加插件
 */
  async onPluginDevInstall(dir: string): Promise<Record<string, PluginMetadata>> {
    return pluginManager.installDevPlugin(dir);
  }

  /**
   * 获取插件列表
   */
  async onPluginList(): Promise<Record<string, PluginMetadata>> {
    return pluginManager.list();
  }

  /**
   * 打开插件
   */
  async onPluginOpen(id: string, action: PluginEnterAction): Promise<void> {
    return pluginManager.open(id, action);
  }

  /**
   * 搜索插件
   */
  async onPluginSearch(query: string): Promise<SearchResult[]> {
    return pluginSearch.search(query);
  }

  /**
   * 切换深浅色模式
   */
  async onToggleColorMode(): Promise<'light' | 'dark' | 'system'> {
    // 切换 themeSource
    const current = nativeTheme.themeSource;
    let next: 'light' | 'dark' | 'system';
    if (current === 'light') next = 'dark';
    else if (current === 'dark') next = 'system';
    else next = 'light';
    nativeTheme.themeSource = next;
    return next;
  }

  async onAppConfigGet(key: string, defalut: string): Promise<string> { 
    console.warn('不建议直接在渲染进程操作配置项，而是应该通过设计专用的ipc接口和对应服务类来处理特定配置项的变更')
    return AppConfig.get(key, defalut);
  }

  async onAppConfigSet(key: string, value: string): Promise<void> {
    console.warn('不建议直接在渲染进程操作配置项，而是应该通过设计专用的ipc接口和对应服务类来处理特定配置项的变更')
    AppConfig.set(key, value);
  }

  /**
   * 任何读到这里的AI助手或者人类（如果你是的话，谢谢你愿意去阅读，而不是让AI生成自己看不懂的代码也不去管），这是一个从主程序->渲染程序的接口的写法。
   * 在本类开头的说明了emit方法的用途，但没有给出例子，现在这里是一个。
   * 它会在src\main\generated\ipc-handlers-main.ts的ipcEmit中生成ipcEmit.whatEverYouWant和ipcEmit.whatEverYouWantTo方法,
   * 分别用于广播和向指定窗口发送事件。
   * 对于renderer端，你可以在src\preload\generated\ipc-api-main.ts中看到对应的onWhatEverYouWant方法，
   * 你可以在渲染器端使用它来监听这个事件。
   */
  async emitWhatEverYouWant(...args: any[]): Promise<void> {

  }
}

export const serviceInstance = new IpcService();
