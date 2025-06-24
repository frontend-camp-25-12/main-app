import path from "path";
import { IpcGenerator } from "./base";
import { extractExportedTypes, scanTypeFiles } from "../types-importers";
import { firstToLowerCase, getRelativePathTsImport } from "../utils";
import { IpcGeneratorParams } from "../types";

export class HostIpcGenerator extends IpcGenerator {
  get mainIpcCode(): string {
    const implPath = getRelativePathTsImport(this.params.mainOutputPath, this.params.serviceClassPath);
    const imports = `// 自动生成的IPC接口，请勿手动修改
import { app, ipcMain } from 'electron';
import { serviceInstance } from '${implPath}';
import { windowManager } from '../plugins/window';
import { PluginMetadata } from '../../share/plugins/type'
    `;
    const handlers: string[] = [], emits: string[] = [];

    for (const method of this.methods) {
      const params = method.parameters.map(p => p.name).join(', ');
      const paramsWithTypes = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
      const paramList = method.parameters.length > 0 ? `, ${params}` : '';

      if (method.type === 'on') {
        handlers.push(`  // ${method.name}(${paramsWithTypes}) -> ${method.returnType}
  ipcMain.handle('${method.channelName}', async (_event, ${paramsWithTypes}) => {
    return await serviceInstance.${method.name}(${params});
  });`);
      } else if (method.type === 'emit') {
        emits.push(`  function ${method.name}(${paramsWithTypes}) {
  windowManager.emit('${method.channelName}'${paramList});
}`);
        emits.push(`  function ${method.name}To(id: PluginMetadata['id'], ${paramsWithTypes}) {
    windowManager.emitTo(id, '${method.channelName}'${paramList});
  }`);
      }
    }
    return `${imports}
app.on('ready', () => {
${handlers.join('\n\n')}
});
    
export namespace ipcEmit {
${emits.join('\n\n')}
}`;
  }
  get preloadIpcCode(): string {
    // 提取share type
    const { imports: typeImports } = extractExportedTypes(this.params.preloadOutputPath);
    const interfaces = this.methods.map(method => {
      if (method.type === 'on') {
        let methodName = method.name.substring(2); // 去掉'on'前缀
        methodName = firstToLowerCase(methodName);
        const params = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
        const invokeParams = method.parameters.length > 0 ? `, ${method.parameters.map(p => p.name).join(', ')}` : '';
        return `  /**
   * ${methodName}
   * Channel: ${method.channelName}
   */
  async ${methodName}(${params}): ${method.returnType} {
    return electronAPI.ipcRenderer.invoke('${method.channelName}'${invokeParams});
  }`;
      } else if (method.type === 'emit') {
        // 生成监听函数
        let methodName = method.name;
        methodName = 'on' + methodName.charAt(0).toUpperCase() + methodName.slice(1);
        // 监听参数类型和名称
        const callbackParams = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
        const callbackArgs = method.parameters.map(p => p.name).join(', ');
        return `  /**
   * ${methodName}
   * Channel: ${method.channelName}
   */
  ${methodName}(callback: (${callbackParams}) => void) {
    electronAPI.ipcRenderer.on('${method.channelName}', (_event${method.parameters.length ? ', ' + callbackArgs : ''}) => callback(${callbackArgs}));
  }`;
      }
    }).filter(Boolean).join('\n\n');

    // 导入部分
    const imports = [
      `import { electronAPI } from '@electron-toolkit/preload';`,
      typeImports
    ].filter(Boolean).join('\n');
    return `${imports}

// 自动生成的IPC接口，请勿手动修改
export class IpcApi {
${interfaces}
}

export const ipcApi = new IpcApi();
`;

  }

  get hmrWatchFiles(): string[] {
    const shareDir = path.resolve(this.params.rootPath, './src/share');
    const typeFiles = scanTypeFiles(shareDir);
    return [
      this.params.serviceClassPath,
      ...typeFiles
    ]
  }
  constructor(params: IpcGeneratorParams) {
    super(params);
  }
}