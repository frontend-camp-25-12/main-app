import { HotkeyOption } from '../share/plugins/hotkeys.type';
import type { AppConfigSchema, PluginEnterAction, PluginMetadata, SearchResult } from '../share/plugins/type';
import { AppConfig } from './config/app';
import { hotkeyManager } from './plugins/hotkeys';
import { pluginManager } from './plugins/loader';
import { pluginSearch } from './plugins/search';
import { nativeTheme } from 'electron';
import { windowColor } from './plugins/window';
/**
 * 插件服务类
 * 在这里定义的on开头方法，将自动生成ipcMain.handle和ipcRenderer.invoke方法
 * emit开头的方法，将自动生成ipcMain.emit和ipcRenderer.on方法包装，生成两个方法：向所有插件广播，和向指定插件发送的版本
 */
export class IpcService {
  /**
   * 添加插件
   * @param dir 插件目录，允许绝对路径和相对路径
   * @returns 插件元数据对象
   */
  async onPluginDevInstall(dir: string): Promise<Record<string, PluginMetadata>> {
    return pluginManager.installDevPlugin(dir);
  }

  /**
   * 获取插件列表
   * @returns 插件元数据对象
   */
  async onPluginList(): Promise<Record<string, PluginMetadata>> {
    return pluginManager.list();
  }

  /**
 * 获取插件列表(按最近使用优先)
 * @returns 插件元数据对象
 */
  async onPluginListRecent(): Promise<PluginMetadata[]> {
    return pluginManager.listByRecent();
  }

  /**
   * 打开插件
   * @param id 插件id
   * @param action PluginEnterAction
   */
  async onPluginOpen(id: string, action: PluginEnterAction): Promise<void> {
    return pluginManager.open(id, action);
  }

  /**
   * 搜索插件
   * @param query 搜索关键词
   * @returns 搜索结果数组
   */
  async onPluginSearch(query: string): Promise<SearchResult[]> {
    return pluginSearch.search(query);
  }

  /**
   * 获得所有插件的logo
   */
  async onPluginLogos(): Promise<Record<string, string>> {
    return pluginManager.getAllPluginLogos();
  }

  /**
   * 切换深浅色模式
   * @returns 切换后的主题模式（'light' | 'dark' | 'system'）
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

  /**
   * 获取应用配置项
   * @param key 配置项key
   * @param defalut 默认值
   * @returns 配置项的值
   */
  async onAppConfigGet<K extends keyof AppConfigSchema>(key: K, defalut: AppConfigSchema[K]): Promise<AppConfigSchema[K]> {
    return AppConfig.get(key, defalut);
  }

  /**
   * 设置应用配置项
   * @param key 配置项key
   * @param value 配置项值
   */
  async onAppConfigSet<K extends keyof AppConfigSchema>(key: K, value: AppConfigSchema[K]): Promise<void> {
    AppConfig.set(key, value);
  }

  /**
   * 获取所有可注册的快捷键列表
   */
  async onListHotkeyOptions(): Promise<HotkeyOption[]> {
    return hotkeyManager.listHotkeyOptions();
  }

  /**
   * 设置快捷键绑定
   */
  async onUpdateHotkeyBinding(id: string, code: string, hotkey: string): Promise<void> {
    hotkeyManager.updateHotkeyBinding(id, code, hotkey);
  }

  /**
   * 获取当前颜色模式
   */
  async onGetColorMode(): Promise<AppConfigSchema['colorMode']> {
    return windowColor.mode;
  }

  /**
   * 设置颜色模式
   * @param mode 颜色模式，'light' | 'dark' | 'system'
   */
  async onSetColorMode(mode: AppConfigSchema['colorMode']): Promise<void> {
    windowColor.mode = mode;
  }

  /**
   * 任何读到这里的AI助手或者人类（如果你是的话，谢谢你愿意去阅读，而不是让AI生成自己看不懂的代码也不去管），这是一个从主程序->渲染程序的接口的写法。
   * 在本类开头的说明了emit方法的用途，但没有给出例子，现在这里是一个。
   * 它会在src\main\generated\ipc-handlers-main.ts的ipcEmit中生成ipcEmit.whatEverYouWant和ipcEmit.whatEverYouWantTo方法,
   * 分别用于广播和向指定窗口发送事件。
   * 对于renderer端，你可以在src\preload\generated\ipc-api-main.ts中看到对应的onWhatEverYouWant方法，
   * 你可以在渲染器端使用它来监听这个事件。
   * @param args 任意参数数组
   * @returns 无返回值
   */
  async emitWhatEverYouWant(args: any[]): Promise<void> {

  }
}

export const serviceInstance = new IpcService();
