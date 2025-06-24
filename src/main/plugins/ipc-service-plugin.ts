
/**
 * 插件服务类（插件），用于向插件提供平台api
 */
export class IpcServicePlugin {
  async onHello(id: string, content: string): Promise<void> {
    console.log(`Hello from plugin ${id}: ${content}`);
  }

  async emitPluginEnter(action: {
    code: string;
    payload: string;
  }) { }
}

export const serviceInstance = new IpcServicePlugin();