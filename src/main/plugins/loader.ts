import path, { join } from "path";
import { PluginMetadata } from "../../share/plugins/type.js";
import fs from "fs";
import { builtinPlugins } from "./builtin.js";
import { windowManager } from "./window.js";
import { PluginDefinitionSchema } from "../../share/plugins/type.zod.d.js";
import { app } from "electron";

const pluginPath = [
];

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
    // 扫描外部插件目录
    for (const path of pluginPath) {
      if (!fs.existsSync(path)) {
        console.warn(`Plugin directory ${path} does not exist`);
        continue;
      }
      const dirs = await fs.promises.readdir(path, { withFileTypes: true });
      for (const dirent of dirs) {
        if (dirent.isDirectory()) {
          const pluginDir = join(path, dirent.name);
          const pluginMetadata = await this.loadPluginDir(pluginDir);
          if (pluginMetadata) {
            allPlugins[pluginMetadata.id] = pluginMetadata;
          }
        }
      }
    }
    this.pluginsResolve(allPlugins);
  }

  /**
   * 加载单个插件目录
   */
  async loadPluginDir(path: string) {
    const pluginJsonPath = join(path, 'plugin.json');
    if (!fs.existsSync(pluginJsonPath)) {
      return null;
    }
    const pluginData = await fs.promises.readFile(pluginJsonPath, "utf-8");
    const raw = JSON.parse(pluginData);
    let pluginDef: PluginMetadata;
    try {
      pluginDef = PluginDefinitionSchema.parse(raw) as PluginMetadata; // 用zod校验和清理字段

    } catch (e) {
      console.warn(`Plugin at ${path} failed zod validation:`, e);
      return null;
    }
    if (this.plugins[pluginDef.name]) {
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
  async add(dir: string) {
    if (!path.isAbsolute(dir)) {
      dir = join(process.cwd(), dir);
    }
    console.log(`Add plugin directory: ${dir}`);

    if (!fs.existsSync(dir)) {
      console.error(`Plugin directory ${dir} does not exist`);
      throw new Error(`目录 ${dir} 不存在`);
    }

    const pluginMetadata = await this.loadPluginDir(dir);
    if (!pluginMetadata) {
      throw new Error(`目录 ${dir} 不是有效的插件目录`);
    }

    const plugins = await this.plugins;
    plugins[pluginMetadata.name] = pluginMetadata;
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

app.on('ready', () => {
  pluginManager.open('builtin.entrance');
});