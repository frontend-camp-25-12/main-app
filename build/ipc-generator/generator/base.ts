import * as ts from 'typescript';
import * as fs from 'fs';
import { firstToLowerCase } from '../utils';
import { IpcGeneratorParams, IpcType, type IpcMethod } from '../types';
import { extractTsdoc } from '../tsdoc-extract';
import { extractExportedTypes } from '../types-importers';

export abstract class IpcGenerator {
  abstract get mainIpcCode(): string
  abstract get preloadIpcCode(): string
  abstract get hmrWatchFiles(): string[]

  params: IpcGeneratorParams;
  methods: IpcMethod[] = [];

  constructor(params: IpcGeneratorParams) {
    this.params = params;
    this.extractServiceMethod();
  }

  generate() {
    fs.writeFileSync(this.params.mainOutputPath, this.mainIpcCode, 'utf-8');
    fs.writeFileSync(this.params.preloadOutputPath, this.preloadIpcCode, 'utf-8');
  }

  private extractServiceMethod() {
    const sourceCode = fs.readFileSync(this.params.serviceClassPath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      this.params.serviceClassPath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );
    this.visitServiceTsNode(sourceFile, sourceFile);
  }

  private visitServiceTsNode(node: ts.Node, sourceFile: ts.SourceFile) {
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
          // 提取TSDoc
          const tsdoc = extractTsdoc(member);

          // 解析方法参数
          const parameters: { name: string; type: string }[] = [];
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
          } else if (methodName.startsWith(IpcType.Emit)) {
            // 'emit' 开头的方法，方向为main调用renderer方法，并广播地发送到所有插件
            channelName = generateChannelName(methodName, IpcType.Emit);
            generatedMethodName = firstToLowerCase(methodName
              .substring(IpcType.Emit.length))
            type = IpcType.Emit;
          }
          if (channelName) {
            this.methods.push({
              type,
              name: generatedMethodName,
              parameters,
              returnType,
              channelName,
              tsdoc
            });
          }
        }
      });
    }

    ts.forEachChild(node, (child) => this.visitServiceTsNode(child, sourceFile));
  }
}

function generateChannelName(name: string, type: IpcType): string {
  return name
    .substring(type.length)
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

export abstract class CommonIpcGenerator extends IpcGenerator {
  // 为了提供给PluginIpcGenerator重写
  generatePreloadInvoke(method: IpcMethod, methodName: string, params: string, invokeParams: string): string {
    return `  /**
   * ${method.tsdoc}
   */
  async ${methodName}(${params}): ${method.returnType} {
    return electronAPI.ipcRenderer.invoke('${method.channelName}'${invokeParams});
  }`;
  }

  private imports?: string = undefined
  get commonImports() {
    if (this.imports === undefined) {
      this.imports = extractExportedTypes(this.params.preloadOutputPath, this.params.rootPath);
    } else {
      return this.imports;
    }
    return this.imports;
  }

  // 为了提供给PluginIpcGenerator重写
  getMethodForPreload() {
    return this.methods
  }

  get commonPreloadCode() {
    return this.getMethodForPreload().map(method => {
      if (method.type === 'on') {
        let methodName = method.name.substring(2); // 去掉'on'前缀
        methodName = firstToLowerCase(methodName);
        const params = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
        const invokeParams = method.parameters.length > 0 ? `, ${method.parameters.map(p => p.name).join(', ')}` : '';
        return this.generatePreloadInvoke(method, methodName, params, invokeParams);
      } else if (method.type === 'emit') {
        // 生成监听函数
        let methodName = method.name;
        methodName = 'on' + methodName.charAt(0).toUpperCase() + methodName.slice(1);
        // 监听参数类型和名称
        const callbackParams = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
        const callbackArgs = method.parameters.map(p => p.name).join(', ');
        return `  /**
   * ${method.tsdoc}
   */
  ${methodName}(callback: (${callbackParams}) => void) {
    electronAPI.ipcRenderer.on('${method.channelName}', (_event${method.parameters.length ? ', ' + callbackArgs : ''}) => callback(${callbackArgs}));
  }`;
      }
      return undefined;
    }).filter(Boolean).join('\n\n');
  }

  get commonMainCode(): [handlers: string, emit: string] {
    const handlers: string[] = [], emits: string[] = [];

    for (const method of this.methods) {
      const params = method.parameters.map(p => p.name).join(', ');
      const paramsWithTypes = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
      const paramList = method.parameters.length > 0 ? `, ${params}` : '';

      if (method.type === 'on') {
        handlers.push(`
  // ${method.name}(${paramsWithTypes}) -> ${method.returnType}
  ipcMain.handle('${method.channelName}', async (_event, ${paramsWithTypes}) => {
    return await serviceInstance.${method.name}(${params});
  });`);
      } else if (method.type === 'emit') {
        emits.push(`  /**
  * ${method.tsdoc}
  */
  export function ${method.name}(${paramsWithTypes}) {
    windowManager.emit('${method.channelName}'${paramList});
  }`);
        emits.push(`  /**
  * ${method.tsdoc}
  */
  export function ${method.name}To(id: PluginMetadata['id'], ${paramsWithTypes}) {
    windowManager.emitTo(id, '${method.channelName}'${paramList});
  }`);
      }
    }
    return [
      handlers.join('\n\n'),
      emits.join('\n\n')
    ];
  }
}