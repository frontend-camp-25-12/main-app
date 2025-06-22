import { app, globalShortcut } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import './plugins/loader'
import { createTray, registerGlobalShortcut } from './plugins/tray' // 导入registerGlobalShortcut

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  
  // 创建托盘图标
  createTray();
  // 注册全局快捷键
  registerGlobalShortcut();
})

// 添加应用退出时取消快捷键注册
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
