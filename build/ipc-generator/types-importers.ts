import { log } from "./log"
import path from "path";
import ts from "typescript";
import * as fs from 'fs';

/**
 * 扫描指定路径下的type.d.ts文件，提取所有导出的类型
 */
export function extractExportedTypes(basePath: string): { imports: string, relativePaths: string[] } {
  try {
    const shareDir = path.resolve(basePath, '../../../share');
    let typeFiles = scanTypeFiles(shareDir);
    const allExports: { path: string, exports: string[] }[] = [];
    for (const filePath of typeFiles) {
      const exports = extractFromFile(filePath);
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
export function scanTypeFiles(dir: string): string[] {
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
function extractFromFile(filePath: string): string[] {
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