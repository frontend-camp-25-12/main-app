import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import * as fs from 'fs'
import * as path from 'path'

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: resolve(__dirname, 'src/preload/generated/ipc-api-plugin.ts'),
      name: 'PluginIpcApi',
    },
    rollupOptions: {
      external: ['@electron-toolkit/preload'],
      output: {
        globals: {
          '@electron-toolkit/preload': 'electronAPI',
        },
      },
    }
  },
  plugins: [
    dts({
      rollupTypes: false,
      outDir: resolve(__dirname, 'out/types'),
      entryRoot: resolve(__dirname, 'src'),
      include: ['src/preload/generated/ipc-api-plugin.ts'],
      afterBuild: (emittedFiles) => {
        /**
         * 把生成的类型文件里面添加对于window.platform的声明
         */
        for (const filePath of emittedFiles.keys()) {
          const content = fs.readFileSync(filePath, 'utf-8');
          const globalDeclare = `
declare global {
  interface Window {
    platform: PlatformApi;
  }
}

export {};
`;
          const finalContent = content.replace(/export declare/g, 'declare') + globalDeclare;

          fs.writeFileSync(filePath, finalContent);     }
      },
      tsconfigPath: 'tsconfig.node.json',
      insertTypesEntry: true,
    })
  ]
})