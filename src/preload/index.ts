import { electronAPI } from '@electron-toolkit/preload'
import { ipcApi } from './generated/ipc-api-main'
import { webUtils } from 'electron'

// @ts-ignore
window.electron = electronAPI
// @ts-ignore
window.ipcApi = ipcApi
// @ts-ignore
window.getPathForFile = (file: File) => {
  return webUtils.getPathForFile(file)
}