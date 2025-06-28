import { app, globalShortcut, session } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createTray } from './tray'
import './plugins/index'
import './generated/ipc-handlers-main'
import './generated/ipc-handlers-plugin'
import './config/service'
import fs from 'fs'
import path from 'path'

// 当前窗口的加载在src\main\plugins\loader.ts中处理

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  //监听渲染进程的下载事件
  session.defaultSession.on('will-download', (event, item, webContents) => {
    //文件名
    const fileName = item.getFilename()
    // 设置下载路径
    const downloadsPath = path.join(app.getPath('userData'), 'plugins')

    // 确保下载目录存在
    if (!fs.existsSync(downloadsPath)) {
      fs.mkdirSync(downloadsPath, { recursive: true })
    }
    //文件路径
    const filePath = path.join(downloadsPath, fileName)
    item.setSavePath(filePath)
    //监听下载完成
    item.once('done', (event, state) => {
      if (state === 'completed') {
        console.log('下载完成，文件保存至: ', filePath)
      } else {
        console.log(`下载失败: ${state}`)
      }
    })
  })

  // 创建托盘图标
  createTray()
})

// 应用退出时取消快捷键注册
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
  // 不退出，因为我们有托盘图标
})
