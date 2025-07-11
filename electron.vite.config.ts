import path, { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { glob } from 'glob'
import { ipcGeneratorPlugin } from './build/ipc-generator/vite-plugin'

/**
 * 约定在src/renderer/src/windows目录下的index.html文件，作为每个窗口的入口
 */
const entries = glob.sync('src/renderer/src/windows/**/index.html').reduce((acc, filePath) => {
  const name = path.basename(path.dirname(filePath));
  acc[name] = filePath;
  return acc;
}, {});

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['original-fs']
      }
    },
    plugins: [
      externalizeDepsPlugin(),
      ipcGeneratorPlugin({
        host: {
          serviceClassPath: resolve('src/main/ipc-service-main.ts'),
          mainOutputPath: resolve('src/main/generated/ipc-handlers-main.ts'),
          preloadOutputPath: resolve('src/preload/generated/ipc-api-main.ts')
        },
        plugin: {
          serviceClassPath: resolve('src/main/plugins/ipc-service-plugin.ts'),
          mainOutputPath: resolve('src/main/generated/ipc-handlers-plugin.ts'),
          preloadOutputPath: resolve('src/preload/generated/ipc-api-plugin.ts')
        }
      }),
    ],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      rollupOptions: {
        input: {
          index: resolve('src/preload/index.ts'),
          pluginIndex: resolve('src/preload/plugin-index.ts')
        },
      },
    }
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      })
    ],
    build: {
      rollupOptions: {
        input: entries,
        output: {
          entryFileNames: `assets/[name]/[name].[hash].js`,
          chunkFileNames: `assets/[name]/[name].[hash].js`,
          assetFileNames: `assets/[name]/[name].[hash].[ext]`,
        }
      },
    },
    root: './src/renderer/src/',
    base: './'
  }
})
