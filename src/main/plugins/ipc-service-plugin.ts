import { configManager } from "../config/service";

/**
 * 插件服务类（插件），用于向插件提供平台api
 */
export class IpcServicePlugin {
  async onHello(id: string, content: string): Promise<void> {
    console.log(`Hello from plugin ${id}: ${content}`);
  }

  async onConfigGet(id: string, key: string, defalut: string): Promise<string> { 
    return configManager.get(id, key, defalut);
  }

  async onConfigSet(id: string, key: string, value: string): Promise<void> {
    configManager.set(id, key, value);
  }

  async emitPluginEnter(action: {
    code: string;
    payload: string;
  }) { }
}

export const serviceInstance = new IpcServicePlugin();