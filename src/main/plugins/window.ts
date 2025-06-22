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

class PluginWindow {
  private window: BrowserWindow;
  private plugin: PluginMetadata;

  constructor(plugin: PluginMetadata) {
    this.plugin = plugin;
    let dist = plugin.dist;
    let preload: string;
    if (plugin.internal) {
      // 内置插件，共享相同preload逻辑
      preload = join(__dirname, '../preload/index.js');
    } else {
      preload = path.join(dist, 'preload.js');
    }

    const window = new BrowserWindow({
      title: plugin.name,
      width: plugin.window?.width ?? 900,
      height: plugin.window?.height ?? 670,
      transparent: plugin.window?.transparent ?? false,
      show: false,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: preload,
        sandbox: false,
        contextIsolation: false,
      },
    })

    window.setMenuBarVisibility(false)
    if (plugin.internal) {
      loadInternalWindow(window, plugin.dist)
    } else {
      window.loadFile(path.join(dist, 'index.html'));
    }
    this.window = window;
  }

  show() {
    this.window.show();
    this.window.focus();
  }

  hide() {
    this.window.hide();
  }

  isVisible(): boolean {
    return this.window.isVisible();
  }

  focus() {
    if (this.window.isMinimized()) {
      this.window.restore();
    }
    this.window.focus();
  }
}

/**
 * 窗口管理器，单例地管理所有插件窗口
 */
class WindowManager {
  private windows: Record<string, PluginWindow> = {};

  add(plugin: PluginMetadata): void {
    const pluginWindow = new PluginWindow(plugin);
    this.windows[plugin.id] = pluginWindow;
  }

  open(plugin: PluginMetadata): void {
    if (this.windows[plugin.id]) {
      this.windows[plugin.id].show();
      return;
    }
    const pluginWindow = new PluginWindow(plugin);
    this.windows[plugin.id] = pluginWindow;
    pluginWindow.show();
  }

  getAllWindows(): Record<string, PluginWindow> {
    return this.windows;
  }

  // 新增方法：获取指定窗口
  getWindow(pluginId: string): PluginWindow | undefined {
    return this.windows[pluginId];
  }

  // 新增方法：隐藏所有窗口
  hideAll() {
    Object.values(this.windows).forEach(window => window.hide());
  }
}

export const windowManager = new WindowManager();