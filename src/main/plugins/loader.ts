import path, { join } from "path";
import { PluginMetadata } from "../../share/plugins/type.js";
import fs from "fs";
import { builtinPlugins } from "./builtin.js";
import { windowManager } from "./window.js";
import { PluginDefinitionSchema } from "../../share/plugins/type.zod.d.js";
import { app } from "electron";

const pluginInstallPath = join(app.getPath('userData'), 'plugins');
const PLUGIN_REQUIRED_FILES = ['plugin.json', 'index.html', 'preload.js'];

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
      if (dirent.isDirectory()) {
        const pluginMetadata = await this.loadPluginDir(dirent.name);
        if (pluginMetadata) {
          allPlugins[pluginMetadata.id] = pluginMetadata;
        }
      }
    }
    this.pluginsResolve(allPlugins);
  }

  /**
   * 加载单个插件目录
   * @param folderName 插件目录名，必须位于pluginInstallPath下
   */
  async loadPluginDir(folderName: string) {
    const path = join(pluginInstallPath, folderName);
    if (!fs.existsSync(path)) {
      return null;
    }
    for (const file of PLUGIN_REQUIRED_FILES) {
      const requireFile = join(path, file);
      if (!fs.existsSync(requireFile)) {
        return null;
      }
    }
    const pluginJsonPath = join(path, 'plugin.json');
    const pluginData = await fs.promises.readFile(pluginJsonPath, "utf-8");
    const raw = JSON.parse(pluginData);
    let pluginDef: PluginMetadata;
    try {
      pluginDef = PluginDefinitionSchema.parse(raw) as PluginMetadata; // 用zod校验和清理字段
    } catch (e) {
      console.warn(`Plugin at ${path} failed zod validation:`, e);
      return null;
    }
    if (this.plugins[pluginDef.id]) {
      throw new Error(`插件 ${pluginDef.name} 已经存在`);
    }

    pluginDef.dist = join(path); // 为了之后从其中加载内容
    windowManager.add(pluginDef); // 添加到窗口管理器，执行其preload脚本
    return pluginDef;
  }

  async list() {
    const plugins = await this.plugins;
    return plugins;
  }

  /**
   * 添加目录作为插件
   * @param dir 插件目录
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
    // 软链接开发中的插件文件夹
    await fs.promises.symlink(dir, installPath, 'dir');
    const pluginMetadata = await this.loadPluginDir(basename);
    if (!pluginMetadata) {
      await fs.promises.rm(installPath, { recursive: true, force: true });
      throw new Error(`目录 ${dir} 不是有效的插件目录`);
    }

    const plugins = await this.plugins;
    plugins[pluginMetadata.id] = pluginMetadata;
    return plugins;
  }

  /**
   * 打开插件窗口
   * @param id 插件标识
   */
  async open(id: string) {
    const plugins = await this.plugins;
    if (!plugins[id]) {
      throw new Error(`Plugin ${id} does not exist`);
    }
    const plugin = plugins[id];
    windowManager.open(plugin);
  }
}

export const pluginManager = new PluginManager();
pluginManager.loadPlugins();
