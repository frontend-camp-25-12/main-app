import { app, globalShortcut } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createTray } from './tray'
import './plugins/index'
import './generated/ipc-handlers-main'
import './generated/ipc-handlers-plugin'
import './config/service'
import { windowManager } from './plugins/window'

// 当前窗口的加载在src\main\plugins\loader.ts中处理

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // 创建托盘图标
  createTray()
  // macOS下隐藏Dock图标
  if (process.platform === 'darwin') {
    app.dock?.hide()
  }
})

// 应用退出时取消快捷键注册
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  // 不退出，因为我们有托盘图标
})

export function appExit() {
  windowManager.destroy() // 销毁所有窗口，其中对background窗口进行了额外处理
  app.quit()
}
