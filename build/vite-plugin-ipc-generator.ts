import { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

interface IpcMethod {
  name: string;
  parameters: { name: string; type: string }[];
  returnType: string;
  channelName: string;
}

function log(message: string) {
  console.log(`[IPC Generator] ${message}`);
}

/**
 * 扫描指定路径下的type.d.ts文件，提取所有导出的类型
 */
function extractExportedTypesFromPath(basePath: string): { imports: string, relativePaths: string[] } {
  try {
    const shareDir = path.resolve(basePath, '../../../share');
    let typeFiles = scanTypeFiles(shareDir);
    const allExports: { path: string, exports: string[] }[] = [];
    for (const filePath of typeFiles) {
      const exports = extractExportsFromFile(filePath);
      if (exports.length > 0) {
        // 计算相对路径
        const relativePath = path.relative(path.dirname(basePath), filePath)
          .replace(/\\/g, '/') // 统一使用正斜杠
          .replace(/\.d\.ts$/, ''); // 移除.d.ts扩展名

        allExports.push({ path: relativePath, exports });
      }
    }

    log(`向preload注入import type: ${allExports.length} 条`);
    // 生成import语句
    const imports = allExports.map(({ path, exports }) => {
      return `import type { ${exports.join(', ')} } from '${path}';`;
    }).join('\n');

    const relativePaths = allExports.map(({ path }) => path);

    return { imports, relativePaths };
  } catch (error) {
    log(`扫描类型文件失败: ${error}`);
    return { imports: '', relativePaths: [] };
  }
}

/**
 * 递归扫描目录下的type.d.ts文件
 */
function scanTypeFiles(dir: string): string[] {
  const typeFiles: string[] = [];

  if (!fs.existsSync(dir)) {
    return typeFiles;
  }

  function scanRecursive(currentDir: string) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const itemPath = path.join(currentDir, item);
      const stat = fs.statSync(itemPath);
      if (stat.isDirectory()) {
        scanRecursive(itemPath);
      } else if (item === 'type.d.ts') {
        typeFiles.push(itemPath);
      }
    }
  }
  scanRecursive(dir);
  return typeFiles;
}

/**
 * 从TypeScript文件中提取所有导出的类型
 */
function extractExportsFromFile(filePath: string): string[] {
  try {
    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(
      filePath,
      sourceCode,
      ts.ScriptTarget.Latest,
      true
    );

    const exports: string[] = [];

    function visit(node: ts.Node) {
      // 处理 export interface
      if (ts.isInterfaceDeclaration(node) &&
        node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
        if (node.name) {
          exports.push(node.name.text);
        }
      }

      // 处理 export type
      if (ts.isTypeAliasDeclaration(node) &&
        node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
        exports.push(node.name.text);
      }

      // 处理 export class
      if (ts.isClassDeclaration(node) &&
        node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
        if (node.name) {
          exports.push(node.name.text);
        }
      }

      // 处理 export enum
      if (ts.isEnumDeclaration(node) &&
        node.modifiers?.some(mod => mod.kind === ts.SyntaxKind.ExportKeyword)) {
        exports.push(node.name.text);
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
    return exports;
  } catch (error) {
    log(`提取导出类型失败 ${filePath}: ${error}`);
    return [];
  }
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

          // 约定只处理以 'on' 开头的方法
          if (!methodName.startsWith('on')) {
            return;
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

          // 生成channel名称：去掉'on'前缀，转换为kebab-case
          const channelName = methodName
            .substring(2)
            .replace(/([A-Z])/g, '-$1')
            .toLowerCase()
            .replace(/^-/, '');

          methods.push({
            name: methodName,
            parameters,
            returnType,
            channelName
          });
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

`;

  const handlers = methods.map(method => {
    const params = method.parameters.map(p => p.name).join(', ');
    const paramList = method.parameters.length > 0 ? `, ${params}` : '';
    const invokeParams = method.parameters.length > 0 ? `${params}` : '';

    return `  // ${method.name}: ${method.parameters.map(p => `${p.name}: ${p.type}`).join(', ')} -> ${method.returnType}
  ipcMain.handle('${method.channelName}', async (_event${paramList}) => {
    return await serviceInstance.${method.name}(${invokeParams});
  });`;
  }).join('\n\n');

  const code = `${imports}
app.on('ready', () => {
${handlers}
});
`;

  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outputPath, code, 'utf-8');
}

function generatePreloadIpcCode(methods: IpcMethod[], outputPath: string) {
  // 提取共享类型的导入
  const { imports: typeImports } = extractExportedTypesFromPath(outputPath);
  const interfaces = methods.map(method => {
    let methodName = method.name.substring(2) // 去掉'on'前缀
    methodName = methodName.charAt(0).toLowerCase() + methodName.slice(1); // 转换为小驼峰命名法
    const params = method.parameters.map(p => `${p.name}: ${p.type}`).join(', ');
    const invokeParams = method.parameters.length > 0 ? `, ${method.parameters.map(p => p.name).join(', ')}` : '';

    return `  /**
   * ${methodName}
   * Channel: ${method.channelName}
   */
  async ${methodName}(${params}): ${method.returnType} {
    return electronAPI.ipcRenderer.invoke('${method.channelName}'${invokeParams});
  }`;
  }).join('\n\n');

  // 构建导入部分
  const imports = [
    `import { electronAPI } from '@electron-toolkit/preload';`,
    typeImports
  ].filter(Boolean).join('\n');

  const code = `${imports}

// 自动生成的IPC接口，请勿手动修改
export class IpcApi {
${interfaces}
}

export const ipcApi = new IpcApi();
`;

  // 确保目录存在
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
