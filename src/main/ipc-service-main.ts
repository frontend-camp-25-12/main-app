import { HotkeyOption } from '../share/plugins/hotkeys.type'
import type {
  AppConfigSchema,
  PluginEnterAction,
  PluginMetadata,
  SearchResult,
  User
} from '../share/plugins/type'
import { AppConfig } from './config/app'
import { hotkeyManager } from './plugins/hotkeys'
import { pluginManager } from './plugins/loader'
import { pluginSearch } from './plugins/search'
import { nativeTheme } from 'electron'
import { entranceWindowManager, windowColor } from './plugins/window'
import { ipcEmit } from './generated/ipc-handlers-main'
import { changeLanguage } from './locales/i18n'
import { ipcEmitPlugin } from './generated/ipc-handlers-plugin'
import { floatButtonManager } from './floatButton'
import { execCommand } from './utils/execCmd'
import { pluginPackageManager } from './plugins/packageManager'
import { HOST } from './api'

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
  async onPluginDevInstall(
    dir: string
  ): Promise<void> {
    pluginPackageManager.installExternal(dir);
  }

  /**
   * 获取插件列表
   * @returns 插件元数据对象
   */
  async onPluginList(): Promise<Record<string, PluginMetadata>> {
    return pluginManager.list()
  }

  /**
   * 获取插件列表(按最近使用优先)
   * @returns 插件元数据对象
   */
  async onPluginListRecent(): Promise<PluginMetadata[]> {
    return pluginManager.listByRecent()
  }

  /**
   * 打开插件
   * @param id 插件id
   * @param action PluginEnterAction
   */
  async onPluginOpen(id: string, action: PluginEnterAction): Promise<void> {
    return pluginManager.open(id, action)
  }

  /**
   * 搜索插件
   * @param query 搜索关键词
   * @returns 搜索结果数组
   */
  async onPluginSearch(query: string): Promise<SearchResult[]> {
    return pluginSearch.search(query)
  }

  /**
   * 获得所有插件的logo
   */
  async onPluginLogos(): Promise<Record<string, string>> {
    return pluginManager.getAllPluginLogos()
  }

  /**
   * 停用插件
   * @param id 插件ID
   */
  async onPluginDisable(id: string): Promise<void> {
    await pluginManager.disable(id)
  }

  /**
   * 启用插件
   * @param id 插件ID
   */
  async onPluginEnable(id: string): Promise<void> {
    await pluginManager.enable(id)
  }

  /**
   * 卸载插件
   * @param id 插件ID
   * @param version 插件版本
   */
  async onPluginRemove(id: string, version: string): Promise<void> {
    await pluginPackageManager.uninstall(id, version)
  }

  /**
   * 下载插件
   * @param id 插件ID
   */
  async onPluginFetchInstall(id: string): Promise<void> {
    await pluginPackageManager.fetchAndInstall(id)
  }

  /**
   * 切换深浅色模式
   * @returns 切换后的主题模式（'light' | 'dark' | 'system'）
   */
  async onToggleColorMode(): Promise<'light' | 'dark' | 'system'> {
    // 切换 themeSource
    const current = nativeTheme.themeSource
    let next: 'light' | 'dark' | 'system'
    if (current === 'light') next = 'dark'
    else if (current === 'dark') next = 'system'
    else next = 'light'
    nativeTheme.themeSource = next
    return next
  }

  /**
   * 获取应用配置项
   * @param key 配置项key
   * @param defalut 默认值
   * @returns 配置项的值
   */
  async onAppConfigGet<K extends keyof AppConfigSchema>(
    key: K,
    defalut: AppConfigSchema[K]
  ): Promise<AppConfigSchema[K]> {
    return AppConfig.get(key, defalut)
  }

  /**
   * 设置主题模式
   */
  async onSetColorMode(mode: 'light' | 'dark' | 'system'): Promise<void> {
    windowColor.mode = mode
  }

  /**
   * 设置应用内设置项
   */
  async onAppConfigSet<K extends keyof AppConfigSchema>(
    key: K,
    value: AppConfigSchema[K]
  ): Promise<void> {
    AppConfig.set(key, value)
  }

  /**
   * 由设置界面调用，告知其它窗口需要重新获取ui相关的配置项
   */
  async onRequireUiConfigReload<K extends keyof AppConfigSchema>(
    key: K,
    value: AppConfigSchema[K]
  ): Promise<void> {
    // 告知其它窗口需要重新获取ui相关的配置项
    ipcEmit.uiConfigChange(key, value)
    // 如果是语言配置项变更，更新主应用语言，然后向外部插件告知
    if (key === 'locale') {
      await changeLanguage(value as AppConfigSchema['locale'])
      ipcEmitPlugin.localePreferenceChange(value as AppConfigSchema['locale'])
    }
  }

  /**
   * 获取所有可注册的快捷键列表
   */
  async onListHotkeyOptions(): Promise<HotkeyOption[]> {
    return hotkeyManager.listHotkeyOptions()
  }

  /**
   * 设置快捷键绑定
   */
  async onUpdateHotkeyBinding(
    id: string,
    code: string,
    hotkey: string
  ): Promise<void> {
    hotkeyManager.updateHotkeyBinding(id, code, hotkey)
  }

  /**
   * 获取当前颜色模式
   */
  async onGetColorMode(): Promise<AppConfigSchema['colorMode']> {
    return windowColor.mode
  }

  /**
   * 悬浮球mousedown事件
   */
  async onFloatingButtonMouseDown(): Promise<void> {
    floatButtonManager.onMouseDown()
  }

  /**
   * 悬浮球mousemove事件
   */
  async onFloatingButtonMouseMove(): Promise<void> {
    floatButtonManager.onMouseMove()
  }

  /**
   * 悬浮球mouseup事件
   */
  async onFloatingButtonMouseUp(): Promise<void> {
    floatButtonManager.onMouseUp()
  }

  /**
   * 切换悬浮球显示状态
   */
  async onFloatingButtonToggle(): Promise<void> {
    AppConfig.set('floatWindow', !AppConfig.get('floatWindow', false));
    floatButtonManager.toggle();
  }

  /**
   * 设置/获取命令入口背景图片
   * 如果imagePath为undefined，则返回当前背景图片路径
   * @return file:/// 路径 | undefined
   */
  async onEntranceBackgroundFile(imagePath: string | undefined): Promise<string | undefined> {
    if (imagePath !== undefined) {
      return entranceWindowManager.setFile(imagePath);
    } else {
      return entranceWindowManager.getFile();
    }
  }

  /**
   * 设置/获取窗口背景白色蒙版强度
   * 如果level为undefined，则返回当前透明度
   */
  async onEntranceBackgroundImageOpacity(level: number | undefined): Promise<number> {
    if (level === undefined) {
      return entranceWindowManager.getImageOpacity();
    } else {
      entranceWindowManager.setImageOpacity(level);
      return level;
    }
  }

  /**
   * 设置/获取入口是否在失去焦点时关闭
   * 如果value为undefined，则返回当前值
   */
  async onEntranceCloseOnBlur(value: boolean | undefined): Promise<boolean> {
    if (value === undefined) {
      return entranceWindowManager.getCloseOnBlur();
    } else {
      entranceWindowManager.setCloseOnBlur(value);
      return value;
    }
  }

  /**
   * 在终端执行命令
   * @param command 要执行的命令
   */
  async onExecCommand(command: string): Promise<void> {
    await execCommand(command);
  }

  /**
   * 获取服务器主机名
   */
  async onGetServerHost(): Promise<string> {
    return HOST;
  }

  /**
   * 广播需要更改界面的配置项变更事件
   * @param key 
   * @param value 
   */
  emitUiConfigChange<K extends keyof AppConfigSchema>(
    key: K,
    value: AppConfigSchema[K]
  ): void { }

  /**
   * 广播需要刷新插件列表的事件
   */
  emitPluginListChange(): void { }

  /**
   * 广播插件下载进度
   * 完成时，将会发送progress为100的事件
   * @param progress 下载进度百分比
   * @param pluginId 插件ID
   */
  emitPluginDownloadProgress(progress: number, pluginId: string): void { }

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
  // async emitWhatEverYouWant(args: any[]): Promise<void> {

  // }
}

export const serviceInstance = new IpcService()
