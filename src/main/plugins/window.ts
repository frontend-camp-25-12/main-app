import { is } from "@electron-toolkit/utils"
import { BrowserWindow } from "electron"
import path, { join } from "path"
import icon from '../../../resources/icon.png?asset'
import { PluginMetadata } from "../../share/plugins/type"

/**
 * 加载窗口内容，针对当前多窗口应用的打包格式，供打开内部插件的窗口时使用
 * @param window BrowserWindow 实例
 * @param name 窗口名称，对应renderer/src/windows/的文件夹
 */
function loadInternalWindow(window: BrowserWindow, name: string): void {
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    window.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/windows/${name}/index.html`)
  } else {
    window.loadFile(join(__dirname, `../renderer/windows/${name}/index.html`))
  }
}

interface PluginWindowContent {
  preload: string;
  dist: string;
}

class PluginWindow {
  window: BrowserWindow | undefined;
  private windowContent: PluginWindowContent | undefined;
  private plugin: PluginMetadata;
  internal: boolean;
  constructor(plugin: PluginMetadata) {
    this.plugin = plugin;
    let dist = plugin.dist;
    let preload: string;
    this.internal = plugin.internal != undefined
    if (plugin.internal) {
      // 内置插件，共享相同preload逻辑
      preload = join(__dirname, '../preload/index.js');
    } else {
      preload = path.join(dist, 'preload.js');
    }
    this.windowContent = {
      preload, dist
    }
    this.create()
  }

  create() {
    const { plugin, windowContent } = this;
    if (!windowContent || !windowContent) {
      throw new Error(`Plugin ${plugin.name} does not have valid window content.`);
    }
    const window = new BrowserWindow({
      title: plugin.name,
      width: plugin.window?.width ?? 900,
      height: plugin.window?.height ?? 670,
      transparent: plugin.window?.transparent ?? false,
      frame: plugin.window?.frame ?? true,
      show: false,
      resizable: plugin.window?.resizable ?? true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: windowContent.preload,
        sandbox: false,
        contextIsolation: false,
      },
    })

    window.setMenuBarVisibility(false)
    if (plugin.internal) {
      loadInternalWindow(window, plugin.dist)
    } else {
      window.loadFile(path.join(windowContent.dist, 'index.html'));
    }
    this.window = window;

    window.on('closed', () => {
      const id = plugin.id;
      windowManager.remove(id);
    });
  }

  show() {
    if (!this.window || this.window.isDestroyed()) {
      this.create();
    }
    if (this.window) {
      if (this.plugin.window?.disableTransition) {
        // 通过切换opacity可以取消窗口进出的过渡动画（windows上有效）
        this.window.setOpacity(0)
        this.window.show()
        this.window.setOpacity(1)
      } else {
        this.window.show()
      }
    }
  }

  hide() {
    this.window?.hide();
  }

  isVisible(): boolean {
    return this.window?.isVisible() ?? false;
  }

  focus() {
    if (this.window?.isMinimized()) {
      this.window.restore();
    }
    this.window?.focus();
  }
}

/**
 * 窗口管理器，单例地管理所有插件窗口
 */
class WindowManager {
  private windows: Record<string, PluginWindow> = {};
  /**
   * 添加一个插件窗口（不打开）
   * @param plugin 插件元数据
   */
  add(plugin: PluginMetadata): void {
    const pluginWindow = new PluginWindow(plugin);
    this.windows[plugin.id] = pluginWindow;
  }

  /**
   * 打开一个插件窗口
   * @param plugin 插件元数据
   */
  open(plugin: PluginMetadata): void {
    if (this.windows[plugin.id]) {
      this.windows[plugin.id].show();
      return;
    }
    const pluginWindow = new PluginWindow(plugin);
    this.windows[plugin.id] = pluginWindow;
    pluginWindow.show();
  }

  /**
   * 获取所有打开的窗口
   */
  getAllWindows(): Record<string, PluginWindow> {
    return this.windows;
  }

  /**
   * 获取指定窗口
   */
  getWindow(pluginId: string): PluginWindow | undefined {
    return this.windows[pluginId];
  }

  /**
   * 隐藏所有窗口
   */
  hideAll() {
    Object.values(this.windows).forEach(window => window.hide());
  }

  /**
   * 移除窗口
   * @param pluginId
   */
  remove(pluginId: string) {
    delete this.windows[pluginId];
  }

  /**
   * 发送ipc事件到所有窗口，只应该在ipc-handlers.ts被中使用
   */
  async emit(channel: string, ...args: any[]) {
    for (const w of Object.values(this.windows)) {
      if (w && w.window && !w.window.isDestroyed()) {
        w.window.webContents.send(channel, ...args);
      }
    }
  }

  /**
   * 发送内部ipc事件，只应该在ipc-handlers.ts被中使用
   */
  async emitInternal(channel: string, ...args: any[]) {
    for (const w of Object.values(this.windows)) {
      if (w && w.internal && w.window && !w.window.isDestroyed()) {
        w.window.webContents.send(channel, ...args);
      }
    }
  }

  /**
   * 发送ipc到指定窗口
   */
  async emitTo(pluginId: string, channel: string, ...args: any[]) {
    const window = this.getWindow(pluginId);
    if (window && window.window && !window.window.isDestroyed()) {
      window.window.webContents.send(channel, ...args);
    }
  }
}

export const windowManager = new WindowManager();
