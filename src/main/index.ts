import { app} from 'electron'
import { electronApp, optimizer} from '@electron-toolkit/utils'
import './plugins/index'
import './generated/ipc-handlers'


// 当前窗口的加载在src\main\plugins\loader.ts中处理

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
