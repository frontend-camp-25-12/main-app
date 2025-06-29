import i18next from "../locales/i18n";
import { PluginEnterAction } from "../../share/plugins/api.type";
import { configManager } from "../config/service";
import { hotkeyManager } from "./hotkeys";
import { pluginManager } from "./loader";

/**
 * 插件服务类（插件），用于向插件提供平台api
 * 添加方法时，请提供准确的tsdoc，在生成的接口中将会一并包含tsdoc，以便开发时参考。
 * 对于on方法，第一个参数必须为id: string，表示触发的插件id
 * 但是注意，id参数会在生成的接口代码中自动附带，不需要使用者操心，所以不需要再tsdoc中说明。
 * 
 * 对于平台API所需要的类型，请在share/plugins/api.type.d.ts中定义，它会被一同打包到类型定义仓库中，以便插件开发者查看。
 */
export class IpcServicePlugin {
  /**
   * 简单的hello方法，用于测试
   * @param content 内容
   * @returns 无返回值
   */
  async onHello(id: string, content: string): Promise<void> {
    console.log(`Hello from plugin ${id}: ${content}`);
  }

  /**
   * 获取插件配置项
   * @param key 配置项key
   * @param defalut 默认值
   * @returns 配置项的值
   */
  async onConfigGet(id: string, key: string, defalut: any): Promise<any> {
    return configManager.get(id, key, defalut);
  }

  /**
   * 设置插件配置项
   * @param key 配置项key
   * @param value 配置项值
   * @returns 无返回值
   */
  async onConfigSet(id: string, key: string, value: any): Promise<void> {
    configManager.set(id, key, value);
  }

  /**
   * 打开快捷键设置页面
   * @param code 要跳转到的希望用户设置快捷键的功能代码
   */
  async onOpenHotkeySettings(id: string, code: string): Promise<void> {
    hotkeyManager.openHotkeySettings(id, code);
  }

  /**
   * 获得上一次enter事件的action，可避免插件中onPluginEnter没有及时监听导致错过action的情况。
   * @returns PluginEnterAction | undefined
   */
  async onGetLastPluginEnterAction(id: string): Promise<PluginEnterAction | undefined> {
    return pluginManager.getLastPluginEnterAction(id);
  }

  /**
   * 插件主动退出
   */
  async onCloseSelf(id: string): Promise<void> {
    pluginManager.close(id);
  }

  /**
   * 获取当前本地化偏好
   */
  async onGetLocalePreference(id: string): Promise<string> {
    return i18next.language;
  }

  /**
   * 插件进入事件
   * @param action PluginEnterAction
   */
  async emitPluginEnter(action: PluginEnterAction) { }

  /**
   * 语言变更事件
   */
  async emitLocalePreferenceChange(language: string) { }
}

export const serviceInstance = new IpcServicePlugin();