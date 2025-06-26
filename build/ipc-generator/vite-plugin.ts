/**
 * Vite 插件，用于生成 IPC 接口代码，同时服务主程序和提供给插件的IPC接口
 * 
 * 对于主程序：
 * 根据src/main/ipc-service-main.ts中定义的插件服务类，生成：
 * src/main/generated/ipc-handlers-main.ts
 *     其中使用ipcMain.handle注册这些IPC方法
 * src/preload/generated/ipc-api-main.ts
 *     其中使用ipcMain.invoke调用对应方法
 * 新增一个主程序的ipc服务，只需要在src/main/ipc-service.ts中对应添加方法，即可在生成接口代码后，在renderer享受带类型提示的ipcApi接口
 * 注意：公共类型需要在src/share/下，任意位置的type.d.ts文件中定义，否则renderer端生成的代码无法正确resolve类型
 * 
 * 对于插件：
 *  根据src/main/plugins/ipc-service-plugin.ts中定义的插件服务类，生成：
 *  src/main/generated/ipc-handlers-plugin.ts
 *      其中使用ipcMain.handle注册这些IPC方法
 *  src/preload/generated/ipc-api-plugin.ts
 *      其中使用ipcMain.invoke调用对应方法
 *
 */
import { Plugin } from 'vite';
import { HostIpcGenerator } from './generator/host';
import { IpcGenerator } from './generator/base';
import { IpcGeneratorOptions } from './types';
import { PluginIpcGenerator } from './generator/plugin';

function generateIpcCode(g: IpcGenerator) {
  g.generate();
}

export function ipcGeneratorPlugin(options: IpcGeneratorOptions): Plugin {
  const generators: IpcGenerator[] = [];
  return {
    name: 'ipc-generator',
    configResolved(config) {
      const { host, plugin } = options;
      const commonParam = {
        rootPath: config.root
      }
      generators.push(new HostIpcGenerator({
        ...commonParam,
        ...host
      }));
      generators.push(new PluginIpcGenerator({
        ...commonParam,
        ...plugin
      }))
    },
    buildStart() {
      for (const g of generators) {
        // for (const file of g.hmrWatchFiles) {
        //   this.addWatchFile(file);
        // }
        generateIpcCode(g);
      }
    },
    handleHotUpdate({ file }) {
      // for (const g of generators) {
      //   for (const watchFile of g.hmrWatchFiles) {
      //     if (file === watchFile) {
      //       generateIpcCode(g);
      //       break;
      //     }
      //   }
      // }
    }
  };
}
