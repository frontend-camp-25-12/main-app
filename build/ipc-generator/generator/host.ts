import path from "path";
import { CommonIpcGenerator } from "./base";
import { extractExportedTypes, scanTypeFiles } from "../types-importers";
import { getRelativePathTsImport } from "../utils";

export class HostIpcGenerator extends CommonIpcGenerator {
  get mainIpcCode(): string {
    const implPath = getRelativePathTsImport(this.params.mainOutputPath, this.params.serviceClassPath);
    const { imports: typeImports } = extractExportedTypes(this.params.preloadOutputPath);
    const imports = `// 自动生成的IPC接口，请勿手动修改
import { app, ipcMain } from 'electron';
import { serviceInstance } from '${implPath}';
import { windowManager } from '../plugins/window';
${typeImports ? `\n${typeImports}` : ''}
    `;
    const [handlers, emits] = this.commonMainCode
    return `${imports}
app.on('ready', () => {
${handlers}
});
    
export namespace ipcEmit {
${emits}
}`;
  }
  get preloadIpcCode(): string {
    const { imports: typeImports } = extractExportedTypes(this.params.preloadOutputPath);
    const imports = [
      `import { electronAPI } from '@electron-toolkit/preload';`,
      typeImports
    ].filter(Boolean).join('\n');
    return `${imports}

// 自动生成的IPC接口，请勿手动修改
export class IpcApi {
${this.commonPreloadCode}
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
}