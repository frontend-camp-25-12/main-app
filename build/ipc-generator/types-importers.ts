import { log } from "./log"
import path from "path";
import ts from "typescript";
import * as fs from 'fs';
import { getRelativePathTsImport } from "./utils";

/**
 * 扫描指定路径下的type.d.ts文件，提取所有导出的类型
 */
export function extractExportedTypes(basePath: string, rootPath: string, include?: string[]): string {
  try {
    const shareDir = path.resolve(basePath, path.join(rootPath, './src/share'));
    let typeFiles = scanTypeFiles(shareDir);
    const allExports: { path: string, exports: string[] }[] = [];
    for (const filePath of typeFiles) {
      if (include && !include.some(pattern => filePath.includes(pattern))) {
        continue;
      }
      const exports = extractFromFile(filePath);
      if (exports.length > 0) {
        const relativePath = getRelativePathTsImport(basePath, filePath)
        allExports.push({ path: relativePath, exports });
      }
    }

    log(`向preload注入import type: ${allExports.length} 条`);
    // 生成import语句
    return allExports.map(({ path, exports }) => {
      return `import type { ${exports.join(', ')} } from '${path}';`;
    }).join('\n');
  } catch (error) {
    log(`扫描类型文件失败: ${error}`);
    return '';
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
      } else if (item.endsWith('type.d.ts')) {
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