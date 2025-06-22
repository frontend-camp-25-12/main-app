import { Tray, Menu, nativeImage, app, BrowserWindow, globalShortcut } from 'electron';
import path from 'path';
import { builtinPlugins } from './builtin';
import { windowManager } from './window';

let tray: Tray | null = null;
const entrancePluginId = builtinPlugins[0].id; // 获取入口插件ID

// 创建系统托盘图标
export function createTray(): void {
  // 加载图标（根据实际路径调整）
  const iconPath = path.join(__dirname, '../../../resources/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
  
  tray = new Tray(icon);
  
  // 创建上下文菜单
  const contextMenu = Menu.buildFromTemplate([
    { 
      label: '显示/隐藏主窗口', 
      click: () => toggleMainWindow()
    },
    { 
      label: '打开设置', 
      click: () => windowManager.open(builtinPlugins[1])
    },
    { type: 'separator' },
    { 
      label: '退出', 
      click: () => app.quit()
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip('我的应用');
  
  // 点击托盘图标切换窗口显示
  tray.on('click', () => toggleMainWindow());
  
  // 注册全局快捷键
  registerGlobalShortcut();
}

// 切换主窗口显示状态
function toggleMainWindow() {
  const entranceWindow = windowManager.getWindow(entrancePluginId);
  
  if (entranceWindow) {
    if (entranceWindow.isVisible()) {
      entranceWindow.hide();
    } else {
      entranceWindow.show();
      entranceWindow.focus();
    }
  } else {
    // 如果窗口不存在则创建
    const entrancePlugin = builtinPlugins.find(p => p.id === entrancePluginId);
    if (entrancePlugin) {
      windowManager.open(entrancePlugin);
    }
  }
}

// 全局快捷键注册
function registerGlobalShortcut() {
  const ret = globalShortcut.register('CommandOrControl+Shift+X', () => {
    toggleMainWindow();
  });
  
  if (!ret) {
    console.error('全局快捷键注册失败');
  }
  
  // 应用退出时取消注册
  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
}