/**
 * Vite 插件，用于生成 IPC 接口代码
 * 根据src/main/ipc-service.ts中定义的插件服务类，生成：
 * src/main/generated/ipc-handlers.ts
 *     其中使用ipcMain.handle注册这些IPC方法
 * src/preload/generated/ipc-api.ts
 *     其中使用ipcMain.invoke调用对应方法
 * 
 * 新增一个主程序的ipc服务，只需要在src/main/ipc-service.ts中对应添加方法，即可在生成接口代码后，在renderer享受带类型提示的ipcApi接口
 * 注意：公共类型需要在src/share/下，任意位置的type.d.ts文件中定义，否则renderer端生成的代码无法正确resolve类型
 */
import { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import { extractExportedTypes, scanTypeFiles } from './types-import';
import { log } from './log';

enum IpcType {
  On = 'on',
  Emit = 'emit',
  EmitInternal = 'emitInternal'
}

interface IpcMethod {
  type: IpcType;
  name: string;
  parameters: { name: string; type: string }[];
  returnType: string;
  channelName: string;
}

function firstToLowerCase(str: string): string {
  return str.charAt(0).toLowerCase() + str.slice(1);
}

function generateIpcCode(options: {
  serviceClassPath: string;
  mainOutputPath: string;
  preloadOutputPath: string;
}) {
  try {
    if (!fs.existsSync(options.serviceClassPath)) {
      log(`ipc接口定义文件不存在，路径: ${options.serviceClassPath}，生成结束`);
      return;
    }

    const methods = extractMethodsFromService(options.serviceClassPath);
    if (methods.length === 0) {
      return;
    }

    generateMainIpcCode(methods, options.mainOutputPath);
    generatePreloadIpcCode(methods, options.preloadOutputPath);
    log(`模板生成完成，共 ${methods.length} 个接口`);
  } catch (error) {
    log(`模板生成失败: ${error}`);
  }
}

function generateChannelName(name: string, type: IpcType): string {
  return name
    .substring(type.length)
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

function extractMethodsFromService(filePath: string): IpcMethod[] {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');

  const sourceFile = ts.createSourceFile(
    filePath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const methods: IpcMethod[] = [];

  function visit(node: ts.Node) {
    if (ts.isClassDeclaration(node)) {
      node.members.forEach(member => {
        if (ts.isMethodDeclaration(member) && member.name && ts.isIdentifier(member.name)) {
          const methodName = member.name.text;

          if (methodName.startsWith('_') || methodName === 'constructor') {
            return;
          }

          if (!methodName.startsWith('on') && !methodName.startsWith('emit')) {
            return
          }

          const parameters: { name: string; type: string }[] = [];

          // 解析方法参数
          member.parameters.forEach(param => {
            if (ts.isIdentifier(param.name)) {
              const paramName = param.name.text;
              let paramType = 'any';

              if (param.type) {
                paramType = param.type.getText(sourceFile);
              }

              parameters.push({ name: paramName, type: paramType });
            }
          });

          // 解析返回类型
          let returnType = 'any';
          if (member.type) {
            returnType = member.type.getText(sourceFile);
          }
          let channelName = '', type: IpcType = IpcType.On;
          let generatedMethodName = methodName;
          if (methodName.startsWith(IpcType.On)) {
            //  'on' 开头的方法，方向为renderer调用main方法
            // 生成channel名称：去掉'on'前缀，转换为kebab-case
            channelName = generateChannelName(methodName, IpcType.On);

            type = IpcType.On;
          } else if (methodName.startsWith(IpcType.EmitInternal)) {
            // 'emitInternal' 开头的方法，方向为main调用renderer方法，并仅发送到内部插件
            channelName = generateChannelName(methodName, IpcType.EmitInternal);
            generatedMethodName = firstToLowerCase(methodName
              .substring(IpcType.EmitInternal.length))

            type = IpcType.EmitInternal;
          } else if (methodName.startsWith(IpcType.Emit)) {
            // 'emit' 开头的方法，方向为main调用renderer方法，并广播地发送到所有插件
            channelName = generateChannelName(methodName, IpcType.Emit);
            generatedMethodName = firstToLowerCase(methodName
              .substring(IpcType.Emit.length))
            type = IpcType.Emit;
          }
          if (channelName) {
            methods.push({
              type,
              name: generatedMethodName,
              parameters,
              returnType,
              channelName
            });
          }
        }
      });
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return methods;
}

function generateMainIpcCode(methods: IpcMethod[], outputPath: string) {
  const imports = `// 自动生成的IPC接口，请勿手动修改
import { app, ipcMain } from 'electron';
import { serviceInstance } from '../ipc-service';
import { windowManager } from '../plugins/window';
import { PluginMetadata } from '../../share/plugins/type'

`;
  const handlers: string[] = [], emits: string[] = [];
  for (const method of methods) {
    const params = method.parameters.map(p => p.name).join(', ');
    const paramList = method.parameters.length > 0 ? `, ${params}` : '';
    const invokeParams = method.parameters.length > 0 ? `${params}` : '';
    if (method.type === 'on') {
      handlers.push(`  // ${method.name}: ${method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')} -> ${method.returnType}
  ipcMain.handle('${method.channelName}', async (_event${paramList}) => {
    return await serviceInstance.${method.name}(${invokeParams});
  });`);
    } else if (method.type === 'emit') {
      emits.push(`  function ${method.name}(${params}) {
    windowManager.emit('${method.channelName}'${paramList});
  }`);
    } else if (method.type === 'emitInternal') {
      emits.push(`  function ${method.name}(${params}) {
    windowManager.emitInternal('${method.channelName}'${paramList});                  
  }`);
    }
    if (method.type === 'emit') {
      emits.push(`  function ${method.name}To(id: PluginMetadata['id'], ${params}) {
    windowManager.emitTo(id, '${method.channelName}'${paramList});
  }`);
    }
  }
  let code = `${imports}
app.on('ready', () => {
${handlers.join('\n\n')}
});

export namespace ipcEmit {
${emits.join('\n\n')}
}
`;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, code, 'utf-8');
}

function generatePreloadIpcCode(methods: IpcMethod[], outputPath: string) {
  // 提取share type
  const { imports: typeImports } = extractExportedTypes(outputPath);
  const interfaces = methods.map(method => {
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
    } else if (method.type === 'emitInternal' || method.type === 'emit') {
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

  // 接口部分
  const code = `${imports}

// 自动生成的IPC接口，请勿手动修改
export class IpcApi {
${interfaces}
}

export const ipcApi = new IpcApi();
`;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, code, 'utf-8');
}


export function ipcGeneratorPlugin(options: {
  serviceClassPath: string;
  mainOutputPath: string;
  preloadOutputPath: string;
}): Plugin {
  return {
    name: 'ipc-generator',
    buildStart() {
      this.addWatchFile(options.serviceClassPath);
      const shareDir = path.resolve(path.dirname(options.preloadOutputPath), '../../share');
      const typeFiles = scanTypeFiles(shareDir);
      typeFiles.forEach(typeFile => {
        this.addWatchFile(typeFile);
      });
      generateIpcCode(options);
    },
    handleHotUpdate({ file }) {
      const resolvedServicePath = path.resolve(options.serviceClassPath);
      const shareDir = path.resolve(path.dirname(options.preloadOutputPath), '../../share');
      const typeFiles = scanTypeFiles(shareDir);
      if (file === resolvedServicePath || typeFiles.includes(file)) {
        generateIpcCode(options);
      }
    }
  };
}
