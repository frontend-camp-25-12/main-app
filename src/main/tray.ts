import { Tray, Menu, nativeImage, app } from 'electron';
import { BuiltinPluginId } from './plugins/builtin';
import { windowColor, windowManager } from './plugins/window';
import { trayIcon } from './icon'
import i18next from './locales/i18n';
import { pluginManager } from './plugins/loader';
import { appExit } from '.';

let tray: Tray | null = null;

// 更新托盘菜单
export function updateTrayMenu() {
  if (!tray) return;

  const contextMenu = Menu.buildFromTemplate([
    {
      label: i18next.t('tray.showHideMain'),
      click: () => toggleMainWindow()
    },
    {
      label: i18next.t('tray.openSettings'),
      click: () => pluginManager.open(BuiltinPluginId.SETTINGS, { code: '', payload: '', from: 'menu' })
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
      click: () => appExit()
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

    app.on('before-quit', function (evt) {
      tray?.destroy();
    });

    console.log('Tray icon created successfully');
  } catch (error) {
    console.error('Failed to create tray icon:', error);
  }
}

function toggleMainWindow() {
  windowManager.getWindow(BuiltinPluginId.ENTRANCE)?.toggle()
}