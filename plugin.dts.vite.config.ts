import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'
import * as fs from 'fs'
import * as path from 'path'
const outDir = resolve(__dirname, 'out/types')
export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: ['src/preload/generated/ipc-api-plugin.ts'],
      name: 'PluginIpcApi',
      formats: ['es']
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
      outDir: outDir,
      entryRoot: resolve(__dirname, 'src'),
      include: ['src/preload/generated/ipc-api-plugin.ts'],
      afterBuild: (emittedFiles) => {
        /**
         * 在生成的ipc-api-plugin.ts文件里面添加对于window.platform的声明
         */
        for (const filePath of emittedFiles.keys()) {
          if (!filePath.endsWith('ipc-api-plugin.d.ts')) {
            continue
          }
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

          fs.writeFileSync(filePath, finalContent);
        }
      },
      tsconfigPath: 'tsconfig.node.json',
      insertTypesEntry: true,
    }),
    {
      name: 'copy-type-dts',
      closeBundle() {
        // 构建结束后复制 api.type.d.ts
        const src = resolve(__dirname, 'src/share/plugins/api.type.d.ts');
        const dest = resolve(outDir, 'share/plugins/api.type.d.ts');
        const destDir = path.dirname(dest);
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(src, dest);
      }
    }
  ]
})