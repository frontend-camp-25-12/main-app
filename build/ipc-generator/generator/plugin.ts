import { IpcMethod } from "../types";
import { extractExportedTypes } from "../types-importers";
import { getRelativePathTsImport } from "../utils";
import { CommonIpcGenerator } from "./base";

export class PluginIpcGenerator extends CommonIpcGenerator {
  get mainIpcCode(): string {
    const implPath = getRelativePathTsImport(this.params.mainOutputPath, this.params.serviceClassPath);
    const [handlers, emits] = this.commonMainCode
    return `import { app, ipcMain } from 'electron';
import { serviceInstance } from '${implPath}';
import { windowManager } from '../plugins/window';
${this.commonImports}
app.on('ready', () => {
${handlers}
});
    
export namespace ipcEmitPlugin {
${emits}
}`;
  }
  override getMethodForPreload() {
    // 插件 -> 主程序 的调用需要带上插件id便于区分，但插件本身不需要关心这件事情。
    // 通过修改生成的代码来实现自动附带this.pluginId的效果。this.pluginId是在插件的初始化preload: src/preload/plugin-index.ts中通过获取窗口参数来设置的。
    return this.methods.map(method => {
      if (method.type === 'on') {
        if (method.parameters.length > 0 && method.parameters[0].name === 'id') {
          return {
            ...method,
            parameters: method.parameters.slice(1), // 去掉id参数，生成提供给插件的接口就不需要考虑id
          }
        } else {
          throw new Error(`ipc-service-plugin的 "${method.name}" 方法的第一个参数必须是id(用来接收插件ID).`);
        }
      } else {
        return method;
      }
    })
  }
  override generatePreloadInvoke(method: IpcMethod, methodName: string, params: string, invokeParams: string): string {

    return `  /**
    * ${method.tsdoc}
    */
  async ${methodName}(${params}): ${method.returnType} {
    return electronAPI.ipcRenderer.invoke('${method.channelName}', this.pluginId${invokeParams});
  }`;
  }

  get preloadIpcCode(): string {
    return `import { electronAPI } from '@electron-toolkit/preload';
${extractExportedTypes(this.params.preloadOutputPath, this.params.rootPath, ['api.type.d.ts'])}

// 自动生成的IPC接口，请勿手动修改
export class PlatformApi {
  pluginId: string;
  constructor(pluginId: string) {
    this.pluginId = pluginId;
  }
${this.commonPreloadCode}
}
`;
  }

  get hmrWatchFiles(): string[] {
    return [
      this.params.serviceClassPath,
    ]
  }
}