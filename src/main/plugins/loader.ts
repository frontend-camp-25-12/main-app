import path, { join } from 'path'
import { PluginEnterAction, PluginMetadata } from '../../share/plugins/type.js'
import fs from 'fs'
import { BuiltinPluginId, builtinPlugins } from './builtin.js'
import { windowManager } from './window.js'
import { PluginDefinitionSchema } from '../../share/plugins/type.zod.d.js'
import { app } from 'electron'
import { ipcEmitPlugin } from '../generated/ipc-handlers-plugin.js'
import { hotkeyManager } from './hotkeys.js'
import asar from 'asar'
import originalFs from 'original-fs'
import { pathToFileURL } from 'url'
import { pluginUsageInfoManager } from './usageInfo.js'
import { ipcEmit } from '../generated/ipc-handlers-main.js'
import http from 'http'
function isAsar(dirent: fs.Dirent | string) {
  try {
    let dirPath: string
    if (typeof dirent === 'string') {
      dirPath = dirent
    } else {
      dirPath = join(dirent.parentPath, dirent.name)
    }
    asar.getRawHeader(dirPath)
    return true
  } catch (error) {
    return false
  }
}

const pluginInstallPath = join(app.getPath('userData'), 'plugins')
const PLUGIN_REQUIRED_FILES = ['plugin.json']

export class PluginManager {
  private plugins: Promise<Record<string, PluginMetadata>>
  private pluginsResolve!: (value: Record<string, PluginMetadata>) => void

  constructor() {
    this.plugins = new Promise<Record<string, PluginMetadata>>((resolve) => {
      this.pluginsResolve = resolve
    })
  }
  /**
   * 发现插件并加载元数据
   */
  async loadPlugins() {
    const allPlugins: Record<string, PluginMetadata> = {}
    // 先加载内置插件
    for (const plugin of builtinPlugins) {
      allPlugins[plugin.id] = plugin as PluginMetadata
    }
    if (!fs.existsSync(pluginInstallPath)) {
      fs.mkdirSync(pluginInstallPath, { recursive: true })
    }
    // 扫描插件目录
    const dirs = await fs.promises.readdir(pluginInstallPath, {
      withFileTypes: true
    })
    for (const dirent of dirs) {
      if (dirent.isDirectory() || dirent.isSymbolicLink() || isAsar(dirent)) {
        const pluginMetadata = await this.loadPluginDir(dirent.name)
        if (pluginMetadata) {
          allPlugins[pluginMetadata.id] = pluginMetadata
        }
      }
    }
    this.pluginsResolve(allPlugins)
    for (const plugin of Object.values(allPlugins)) {
      this.afterLoadPlugin(plugin)
    }
  }

  async afterLoadPlugin(plugin: PluginMetadata) {
    pluginUsageInfoManager.add(plugin) // 必须最先把plugin交给它，用来补充PluginUsageInfoSchema内的状态信息
    this.resolveLogo(plugin)
    windowManager.add(plugin)
    hotkeyManager.add(plugin)
  }

  /**
   * 处理插件的logo路径
   * 对于外部插件：
   * 确保plugin.logo是绝对路径
   * logoPath是一个file://URL
   */
  private resolveLogo(plugin: PluginMetadata) {
    if (plugin.logo) {
      if (plugin.internal) {
        // @see src/main/plugins/builtin.ts
        /**
         * logo通过vite静态资源规则，转移到out/renderer/icon下。
         * plugin.logo是图标的文件名，不含路径信息。
         * 对于主进程，需要转换成相对于out/main/index.js的相对路径格式，如'../renderer/icon/icon-settings.png'
         * 对于渲染进程，需要转换成成相对于out/renderer/windows/xxx/index.html的相对路径格式，如'../../icon/icon-settings.png'
         */
        const logoFileName = plugin.logo
        plugin.logo = path.join(
          __dirname,
          '..',
          'renderer',
          'icon',
          logoFileName
        )
        plugin.logoPath = path.join('..', '..', 'icon', logoFileName)
      } else {
        let pass = false
        if (!path.isAbsolute(plugin.logo)) {
          // 确保路径是相对的且不超出其目录范围
          const logoPath = path.resolve(plugin.dist, plugin.logo)
          if (logoPath.startsWith(plugin.dist + path.sep)) {
            if (fs.existsSync(logoPath)) {
              pass = true
              plugin.logo = logoPath
              plugin.logoPath = pathToFileURL(logoPath).toString()
            }
          }
        }
        if (!pass) {
          plugin.logo = undefined
          plugin.logoPath = undefined
        }
      }
    }
  }

  /**
   * 加载单个插件目录
   * @param folderName 插件目录名，必须位于pluginInstallPath下
   */
  async loadPluginDir(folderName: string) {
    const pluginPath = join(pluginInstallPath, folderName)
    if (!fs.existsSync(pluginPath)) {
      return null
    }
    for (const file of PLUGIN_REQUIRED_FILES) {
      const requireFile = join(pluginPath, file)
      if (!fs.existsSync(requireFile)) {
        return null
      }
    }

    const pluginJsonPath = join(pluginPath, 'plugin.json')
    const pluginData = await fs.promises.readFile(pluginJsonPath, 'utf-8')
    const raw = JSON.parse(pluginData)

    let pluginDef: PluginMetadata
    try {
      pluginDef = PluginDefinitionSchema.parse(raw) as PluginMetadata // 用zod校验和清理字段
    } catch (e) {
      console.warn(`Plugin at ${pluginPath} failed zod validation:`, e)
      return null
    }

    if (this.plugins[pluginDef.id]) {
      throw new Error(`插件 ${pluginDef.name} 已经存在`)
    }

    pluginDef.dist = pluginPath // 为了之后从其中加载内容
    return pluginDef
  }

  async list() {
    const plugins = await this.plugins
    return plugins
  }

  async listByRecent() {
    const plugins = await this.plugins
    return pluginUsageInfoManager.getRecentlyOrder().map((id) => plugins[id])
  }

  async get(id: string) {
    const plugins = await this.plugins
    const plugin = plugins[id]
    if (!plugin) {
      throw new Error(`Plugin ${id} does not exist`)
    }
    return plugin
  }

  async getAllPluginLogos() {
    const plugins = await this.plugins
    const logos: Record<string, string> = {}
    for (const plugin of Object.values(plugins)) {
      if (plugin.logoPath) {
        logos[plugin.id] = plugin.logoPath
      }
    }
    return logos
  }

  /**
   * 安装插件
   * @param dir 插件目录或asar文件
   */
  async installPlugin(dir: string) {
    if (!path.isAbsolute(dir)) {
      dir = join(process.cwd(), dir)
    }

    if (!fs.existsSync(dir)) {
      console.error(`Plugin directory ${dir} does not exist`)
      throw new Error(`目录 ${dir} 不存在`)
    }
    const basename = path.basename(dir)
    const installPath = join(pluginInstallPath, basename)
    if (fs.existsSync(installPath)) {
      await fs.promises.rm(installPath, { recursive: true, force: true })
    }
    if (isAsar(dir)) {
      originalFs.copyFileSync(dir, installPath)
    } else {
      // 软链接开发中的插件文件夹
      await fs.promises.symlink(dir, installPath, 'dir')
    }
    const pluginMetadata = await this.loadPluginDir(basename)
    if (!pluginMetadata) {
      await fs.promises.rm(installPath, { recursive: true, force: true })
      throw new Error(`目录 ${dir} 不是有效的插件目录`)
    }

    const plugins = await this.plugins
    plugins[pluginMetadata.id] = pluginMetadata
    this.afterLoadPlugin(pluginMetadata)
    ipcEmit.pluginListChange()
    console.log(`Added plugin directory: ${dir}`)
    return plugins
  }

  /**
   * 卸载插件
   * @param id 插件标识
   */
  async remove(id: string) {
    const pluginList = await this.plugins
    const plugin = await this.get(id)
    if (plugin.internal) {
      return
    }

    windowManager.remove(id)
    hotkeyManager.remove(id)
    pluginUsageInfoManager.remove(id)

    // 从插件列表中移除
    delete pluginList[id]

    // 删除插件文件
    const pluginPath = join(pluginInstallPath, path.basename(plugin.dist))
    if (originalFs.existsSync(pluginPath)) {
      if (isAsar(pluginPath)) {
        originalFs.rmSync(pluginPath, { recursive: true, force: true })
      } else if (fs.lstatSync(pluginPath).isSymbolicLink()) {
        fs.unlinkSync(pluginPath)
      }
    }

    console.log(`Plugin ${plugin.name} (${id}) has been removed successfully`)
    ipcEmit.pluginListChange()
  }

  /**
   * 下载插件
   * @param id 插件标识
   */
  async download(id: string) {
    const filePath = join(pluginInstallPath, `${id}.asar`)
    const tempPath = join(pluginInstallPath, `${id}`)
    const file = fs.createWriteStream(tempPath)
    http
      .get(`http:localhost:8080/plugin/${id}`, (response) => {
        const totalBytes = parseInt(response.headers['content-length'] || '0')
        let receivedBytes = 0

        response.on('data', (chunk) => {
          receivedBytes += chunk.length
          const percent = Math.round((receivedBytes / totalBytes) * 100)
          // 发送进度到渲染进程
          ipcEmit.pluginDownloadProgressTo(BuiltinPluginId.PLUGINSTORE, percent)
        })

        response.pipe(file)

        file.on('finish', async () => {
          file.close()
          fs.rename(tempPath, filePath, async () => {
            await this.installPlugin(filePath)
            ipcEmit.pluginFinishDownloadTo(BuiltinPluginId.PLUGINSTORE)
          })
        })
      })
      .on('error', (error) => {
        fs.unlink(tempPath, () => console.log(error))
      })
  }

  /**
   * 关闭插件
   * @param id 插件标识
   */
  async disable(id: string) {
    const plugin = await this.get(id)
    if (plugin.internal) {
      return
    }
    pluginUsageInfoManager.disable(plugin)
    windowManager.remove(id)
    hotkeyManager.disable(id)
    ipcEmit.pluginListChange()
  }

  /**
   * 启用插件
   * @param id 插件标识
   */
  async enable(id: string) {
    const plugin = await this.get(id)
    if (plugin.internal) {
      return
    }

    pluginUsageInfoManager.enable(plugin)
    hotkeyManager.enable(id)
    ipcEmit.pluginListChange()
  }

  /**
   * 打开插件窗口
   * @param id 插件标识
   */
  async open(id: string, action: PluginEnterAction) {
    const plugins = await this.plugins
    if (!plugins[id]) {
      throw new Error(`Plugin ${id} does not exist`)
    }
    const plugin = plugins[id]
    windowManager.open(plugin)
    ipcEmitPlugin.pluginEnterTo(plugin.id, action)
    plugin.lastEnterAction = action
    pluginUsageInfoManager.onOpen(plugin.id)
  }

  /**
   * 关闭插件窗口
   */
  async close(id: string) {
    const plugin = await this.get(id)
    windowManager.close(plugin.id)
  }

  /**
   * 获得上一次enter事件的action
   * @param id
   */
  async getLastPluginEnterAction(id: string) {
    const plugins = await this.plugins
    return plugins[id]?.lastEnterAction
  }
}

export const pluginManager = new PluginManager()
app.whenReady().then(() => {
  pluginManager.loadPlugins()
})