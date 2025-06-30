import icon from '../../resources/icon/icon.png?asset'
import trayIconWin from '../../resources/icon/win/icon.ico?asset'
import trayIconMac from '../../resources/icon/mac/iconTamplate.png?asset'

export const trayIcon = process.platform === 'win32' ? trayIconWin : (process.platform === 'darwin' ? trayIconMac : icon);
export const appIcon = icon;