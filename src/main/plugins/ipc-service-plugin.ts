
/**
 * 插件服务类（插件），用于向插件提供平台api
 */
export class IpcServicePlugin {
  async onHello(content: string): Promise<void> {
    console.log(`Hello from plugin: ${content}`);
  }
}

export const serviceInstance = new IpcServicePlugin();