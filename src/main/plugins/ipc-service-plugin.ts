import { configManager } from "../config/service";

/**
 * 插件服务类（插件），用于向插件提供平台api
 */
export class IpcServicePlugin {
  /**
   * 简单的hello方法，用于测试
   * @param id 插件id
   * @param content 内容
   * @returns 无返回值
   */
  async onHello(id: string, content: string): Promise<void> {
    console.log(`Hello from plugin ${id}: ${content}`);
  }

  /**
   * 获取插件配置项
   * @param id 插件id
   * @param key 配置项key
   * @param defalut 默认值
   * @returns 配置项的值
   */
  async onConfigGet(id: string, key: string, defalut: string): Promise<string> { 
    return configManager.get(id, key, defalut);
  }

  /**
   * 设置插件配置项
   * @param id 插件id
   * @param key 配置项key
   * @param value 配置项值
   * @returns 无返回值
   */
  async onConfigSet(id: string, key: string, value: string): Promise<void> {
    configManager.set(id, key, value);
  }

  /**
   * 插件进入事件
   * @param action 包含code（在你的plugin.json中定义）和 payload（用户输入）
   */
  async emitPluginEnter(action: {
    code: string;
    payload: string;
  }) { }
}

export const serviceInstance = new IpcServicePlugin();