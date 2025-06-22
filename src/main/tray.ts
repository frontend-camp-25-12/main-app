import { Tray, Menu, nativeImage, app,  globalShortcut, ipcMain } from 'electron';
import { builtinPlugins } from './plugins/builtin';
import { windowManager } from './plugins/window';
import { t } from './i18n';
import trayIcon from '../../../resources/tray-icon.png?asset'

let tray: Tray | null = null;
const entrancePluginId = builtinPlugins[0].id; // 获取入口插件ID

// 更新托盘菜单
function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    { 
      label: t('showHideMain'), 
      click: () => toggleMainWindow()
    },
    { 
      label: t('openSettings'), 
      click: () => windowManager.open(builtinPlugins[1])
    },
    { type: 'separator' },
    { 
      label: t('quit'), 
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);
}

// 创建系统托盘图标
export function createTray(): void {
  try {
    console.log('Tray icon path:', trayIcon);
    const icon = nativeImage.createFromPath(trayIcon).resize({ width: 32, height: 32 });

    tray = new Tray(icon);
    tray.setToolTip(t('appName'));

    updateTrayMenu();
    tray.on('click', () => toggleMainWindow());

    // 监听语言变化
    ipcMain.on('language-changed', () => {
      updateTrayMenu();
      tray?.setToolTip(t('appName'));
    });

    console.log('Tray icon created successfully');
  } catch (error) {
    console.error('Failed to create tray icon:', error);
  }
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
export function registerGlobalShortcut() {
  const ret = globalShortcut.register('CommandOrControl+Shift+X', () => {
    toggleMainWindow();
  });

  if (!ret) {
    console.error('全局快捷键注册失败');
  }

  app.on('will-quit', () => {
    globalShortcut.unregisterAll();
  });
}