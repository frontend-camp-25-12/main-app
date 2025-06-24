import { getRelativePathTsImport } from "../utils";
import { CommonIpcGenerator } from "./base";

export class PluginIpcGenerator extends CommonIpcGenerator {
  get mainIpcCode(): string {
    const implPath = getRelativePathTsImport(this.params.mainOutputPath, this.params.serviceClassPath);
    const [handlers, emits] = this.commonMainCode
    return `import { app, ipcMain } from 'electron';
import { serviceInstance } from '${implPath}';
app.on('ready', () => {
${handlers}
});
    
export namespace ipcEmitPlugin {
${emits}
}`;
  }
  get preloadIpcCode(): string {
    const imports = [
      `import { electronAPI } from '@electron-toolkit/preload';`,
    ].filter(Boolean).join('\n');
    return `${imports}

// 自动生成的IPC接口，请勿手动修改
export class PlatformApi {
${this.commonPreloadCode}
}

export const platform = new PlatformApi();
`;
  }

  get hmrWatchFiles(): string[] {
    return [
      this.params.serviceClassPath,
    ]
  }
}