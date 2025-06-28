import path, { join } from "path";
import { PluginEnterAction, PluginMetadata } from "../../share/plugins/type.js";
import fs from "fs";
import { builtinPlugins } from "./builtin.js";
import { windowManager } from "./window.js";
import { PluginDefinitionSchema } from "../../share/plugins/type.zod.d.js";
import { app } from "electron";
import { ipcEmitPlugin } from "../generated/ipc-handlers-plugin.js";
import { hotkeyManager } from "./hotkeys.js";
import asar from "asar";
import originalFs from "original-fs";

function isAsar(dirent: fs.Dirent | string) {
  try {
    let dirPath: string;
    if (typeof dirent === 'string') {
      dirPath = dirent;
    } else {
      dirPath = join(dirent.parentPath, dirent.name);
    }
    asar.listPackage(dirPath);
    return true;
  } catch (error) {
    return false;
  }
}

const pluginInstallPath = join(app.getPath('userData'), 'plugins');
const PLUGIN_REQUIRED_FILES = ['plugin.json'];

export class PluginManager {
  private plugins: Promise<Record<string, PluginMetadata>>;
  private pluginsResolve!: (value: Record<string, PluginMetadata>) => void;

  constructor() {
    this.plugins = new Promise<Record<string, PluginMetadata>>((resolve) => {
      this.pluginsResolve = resolve;
    });
  }
  /**
   * 发现插件并加载元数据
   */
  async loadPlugins() {
    const allPlugins: Record<string, PluginMetadata> = {};
    // 先加载内置插件
    for (const plugin of builtinPlugins) {
      allPlugins[plugin.id] = plugin;
    }
    if (!fs.existsSync(pluginInstallPath)) {
      fs.mkdirSync(pluginInstallPath, { recursive: true });
    }
    // 扫描插件目录
    const dirs = await fs.promises.readdir(pluginInstallPath, { withFileTypes: true });
    for (const dirent of dirs) {
      if (dirent.isDirectory() || dirent.isSymbolicLink() || isAsar(dirent)) {
        const pluginMetadata = await this.loadPluginDir(dirent.name);
        if (pluginMetadata) {
          allPlugins[pluginMetadata.id] = pluginMetadata;
        }
      }
    }
    this.pluginsResolve(allPlugins);
    for (const plugin of Object.values(allPlugins)) {
      this.afterLoadPlugin(plugin);
    }
  }

  async afterLoadPlugin(plugin: PluginMetadata) {
    windowManager.add(plugin);
    hotkeyManager.add(plugin);
  }

  /**
   * 加载单个插件目录
   * @param folderName 插件目录名，必须位于pluginInstallPath下
   */
  async loadPluginDir(folderName: string) {
    const pluginPath = join(pluginInstallPath, folderName);
    if (!fs.existsSync(pluginPath)) {
      return null;
    }
    for (const file of PLUGIN_REQUIRED_FILES) {
      const requireFile = join(pluginPath, file);
      if (!fs.existsSync(requireFile)) {
        return null;
      }
    }
    const pluginJsonPath = join(pluginPath, 'plugin.json');
    const pluginData = await fs.promises.readFile(pluginJsonPath, "utf-8");
    const raw = JSON.parse(pluginData);
    let pluginDef: PluginMetadata;
    try {
      pluginDef = PluginDefinitionSchema.parse(raw) as PluginMetadata; // 用zod校验和清理字段
    } catch (e) {
      console.warn(`Plugin at ${pluginPath} failed zod validation:`, e);
      return null;
    }
    if (this.plugins[pluginDef.id]) {
      throw new Error(`插件 ${pluginDef.name} 已经存在`);
    }
    if (pluginDef.logo) {
      if (!path.isAbsolute(pluginDef.logo)) {
        // 确保路径是相对的且不超出其目录范围
        const logoPath = path.resolve(pluginPath, pluginDef.logo);
        if (logoPath.startsWith(pluginPath + path.sep)) {
          if (fs.existsSync(logoPath)) {
            pluginDef.logoPath = logoPath;
          }
        }
      }
    }
    pluginDef.dist = pluginPath; // 为了之后从其中加载内容
    return pluginDef;
  }

  async list() {
    const plugins = await this.plugins;
    return plugins;
  }

  async getAllPluginLogos() {
    const plugins = await this.plugins;
    const logos: Record<string, string> = {};
    for (const plugin of Object.values(plugins)) {
      if (plugin.logoPath) {
        logos[plugin.id] = plugin.logoPath;
      }
    }
    return logos;
  }

  /**
   * 安装开发中的插件目录
   * @param dir 插件目录或asar文件
   */
  async installDevPlugin(dir: string) {
    if (!path.isAbsolute(dir)) {
      dir = join(process.cwd(), dir);
    }
    console.log(`Add plugin directory: ${dir}`);

    if (!fs.existsSync(dir)) {
      console.error(`Plugin directory ${dir} does not exist`);
      throw new Error(`目录 ${dir} 不存在`);
    }
    const basename = path.basename(dir);
    const installPath = join(pluginInstallPath, basename);
    if (fs.existsSync(installPath)) {
      await fs.promises.rm(installPath, { recursive: true, force: true });
    }
    if (isAsar(dir)) {
      originalFs.copyFileSync(dir, installPath);
    } else {
      // 软链接开发中的插件文件夹
      await fs.promises.symlink(dir, installPath, 'dir');
    }
    const pluginMetadata = await this.loadPluginDir(basename);
    if (!pluginMetadata) {
      await fs.promises.rm(installPath, { recursive: true, force: true });
      throw new Error(`目录 ${dir} 不是有效的插件目录`);
    }

    const plugins = await this.plugins;
    plugins[pluginMetadata.id] = pluginMetadata;
    this.afterLoadPlugin(pluginMetadata);
    return plugins;
  }

  /**
   * 打开插件窗口
   * @param id 插件标识
   */
  async open(id: string, action: PluginEnterAction) {
    const plugins = await this.plugins;
    if (!plugins[id]) {
      throw new Error(`Plugin ${id} does not exist`);
    }
    const plugin = plugins[id];
    windowManager.open(plugin);
    ipcEmitPlugin.pluginEnterTo(plugin.id, action);
    plugin.lastEnterAction = action;
  }

  /**
   * 获得上一次enter事件的action
   * @param id 
   */
  async getLastPluginEnterAction(id: string) {
    const plugins = await this.plugins;
    return plugins[id]?.lastEnterAction;
  }
}

export const pluginManager = new PluginManager();
pluginManager.loadPlugins();
