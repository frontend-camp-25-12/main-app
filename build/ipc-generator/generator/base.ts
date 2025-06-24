import * as ts from 'typescript';
import * as fs from 'fs';
import { firstToLowerCase } from '../utils';
import { IpcGeneratorParams, IpcType, type IpcMethod } from '../types';

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
              channelName
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
