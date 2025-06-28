import { Tray, Menu, nativeImage, app, globalShortcut, ipcMain, nativeTheme } from 'electron';
import { BuiltinPluginId, builtinPlugins } from './plugins/builtin';
import { windowColor, windowManager } from './plugins/window';
import trayIcon from '../../resources/tray-icon.png?asset'
import i18next from './locales/i18n';

let tray: Tray | null = null;
const entrancePluginId = BuiltinPluginId.ENTRANCE;

// 更新托盘菜单
function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: i18next.t('tray.showHideMain'),
      click: () => toggleMainWindow()
    },
    {
      label: i18next.t('tray.openSettings'),
      click: () => windowManager.open(builtinPlugins[1])
    },
    {
      label: {
        "system": i18next.t('tray.colorMode.system'),
        "light": i18next.t('tray.colorMode.light'),
        "dark": i18next.t('tray.colorMode.dark')
      }[windowColor.mode],
      click: () => {
        windowColor.toggleMode();
        updateTrayMenu();
      }
    },
    { type: 'separator' },
    {
      label: i18next.t('quit'),
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(contextMenu);
}

// 创建系统托盘图标
export function createTray(): void {
  try {
    const icon = nativeImage.createFromPath(trayIcon).resize({ width: 32, height: 32 });

    tray = new Tray(icon);
    tray.setToolTip(i18next.t('appName'));

    updateTrayMenu();
    tray.on('click', () => toggleMainWindow());

    // 监听语言变化
    ipcMain.on('language-changed', () => {
      updateTrayMenu();
      tray?.setToolTip(i18next.t('appName'));
    });

    console.log('Tray icon created successfully');
  } catch (error) {
    console.error('Failed to create tray icon:', error);
  }
}

function toggleMainWindow() {
  windowManager.getWindow(entrancePluginId)?.toggle()
}