import { is } from "@electron-toolkit/utils"
import { BrowserWindow, ipcMain, nativeTheme } from "electron"
import path, { join } from "path"
import icon from '../../../resources/icon.png?asset'
import { PluginMetadata } from "../../share/plugins/type"
import { AppConfig } from "../config/app"

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
  private additionalArguments: string[] = [];
  constructor(plugin: PluginMetadata) {
    this.plugin = plugin;
    let dist = plugin.dist;
    let preload: string;
    this.internal = plugin.internal != undefined
    preload = join(__dirname, '../preload/pluginIndex.js');
    if (plugin.internal) {
      const internalPreload = join(__dirname, '../preload/index.js');
      // 内置插件也会先从插件的preload开始，再加载内部的preload
      this.additionalArguments = [`--plugin-id=${plugin.id}`, `--plugin-preload=${internalPreload}`];
    } else {
      // 插件的preload是特殊的为其注入平台api的preload(src/preload/plugin-index.ts)
      const pluginPreload = join(dist, plugin.preload || 'preload.js');
      // 在其中，将会读取这些参数，真正加载插件preload
      this.additionalArguments = [`--plugin-id=${plugin.id}`, `--plugin-preload=${pluginPreload}`];
    }
    this.windowContent = {
      preload, dist
    }
    if (plugin.background && !plugin.disabled) {
      this.create()
    }
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
      icon: plugin.logoPath,
      alwaysOnTop: plugin.window?.alwaysOnTop ?? false,
      ...(process.platform === 'linux' ? { icon } : {}),
      backgroundColor: windowColor.backgroundColor(),
      webPreferences: {
        preload: windowContent.preload,
        sandbox: false,
        contextIsolation: false,
        additionalArguments: this.additionalArguments,
      },
    })

    window.setMenuBarVisibility(false)
    if (plugin.internal) {
      loadInternalWindow(window, plugin.dist)
    } else {
      window.loadFile(path.join(windowContent.dist, plugin.content || 'index.html'));
    }
    this.window = window;

    if (plugin.background) {
      // 后台保持类型的插件不销毁实例，仅隐藏
      window.on('close', (event) => {
        if (windowManager.shouldExit) {
          window.destroy();
          return;
        } else {
          event.preventDefault();
          window.hide();
        }
      });
    }
  }

  private getWindow() {
    if (!this.window || this.window.isDestroyed()) {
      this.create();
    }
    return this.window!;
  }

  show() {
    const win = this.getWindow();
    if (win && !this.isVisible()) {
      if (this.plugin.window?.disableTransition) {
        // 通过切换opacity可以取消窗口进出的过渡动画（windows上有效）
        win.setOpacity(0)
        win.show()
        win.setOpacity(1)
      } else {
        win.show()
      }
    }
  }

  hide() {
    this.getWindow().hide();
  }

  isVisible(): boolean {
    return this.getWindow().isVisible() ?? false;
  }

  focus() {
    const win = this.getWindow();
    if (win.isMinimized()) {
      win.restore();
    }
    win.focus();
  }

  toggle() {
    if (this.isVisible()) {
      this.hide();
    } else {
      this.show();
    }
  }
}

/**
 * 窗口管理器，单例地管理所有插件窗口
 */
class WindowManager {
  private windows: Record<string, PluginWindow> = {};
  private _shouldExit: boolean = false; // 用于Background插件的window退出
  get shouldExit() {
    return this._shouldExit;
  }
  /**
   * 添加一个插件窗口（不打开）
   * @param plugin 插件元数据
   */
  add(plugin: PluginMetadata): void {
    const pluginWindow = new PluginWindow(plugin);
    this.windows[plugin.id] = pluginWindow;
  }

  /**
   * 打开/创建一个插件窗口
   * @param plugin 插件元数据
   */
  open(plugin: PluginMetadata): void {
    if (this.windows[plugin.id]) {
      this.windows[plugin.id].show();
      this.windows[plugin.id].focus();
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
   * 关闭所有窗口
   */
  destroy() {
    this._shouldExit = true;
    Object.values(this.windows).forEach(window => {
      if (window.window && !window.window.isDestroyed()) {
        window.window.close();
      }
    });
    this.windows = {};
  }
  /**
   * 移除窗口
   * @param pluginId
   */
  remove(pluginId: string) {
    const pluginWindow = this.windows[pluginId];
    if (pluginWindow) {
      // 如果窗口存在且未被销毁，先关闭窗口
      if (pluginWindow.window && !pluginWindow.window.isDestroyed()) {
        pluginWindow.window.removeAllListeners(); // 移除所有事件监听器
        pluginWindow.window.close();
      }
      delete this.windows[pluginId];
    }
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

class WindowColor {
  private shouldDark: boolean;
  constructor() {
    this.mode = AppConfig.get('colorMode', 'system')
    this.shouldDark = nativeTheme.shouldUseDarkColors;
    nativeTheme.on('updated', () => {
      this.shouldDark = nativeTheme.shouldUseDarkColors;
      BrowserWindow.getAllWindows().forEach((win) => {
        if (!win.isDestroyed()) {
          win.setBackgroundColor(this.backgroundColor());
        }
      });
    });
  }

  set mode(mode: typeof nativeTheme['themeSource']) {
    nativeTheme.themeSource = mode;
    AppConfig.set('colorMode', mode);
  }

  get mode() {
    return nativeTheme.themeSource;
  }

  backgroundColor(): string {
    return this.shouldDark ? '#1e1e1e' : '#ffffff';
  }

  toggleMode() {
    const modes: Array<typeof nativeTheme['themeSource']> = ['light', 'dark', 'system'];
    const next = modes[(modes.indexOf(this.mode) + 1) % modes.length];
    this.mode = next;
  }
}
export const windowColor = new WindowColor();