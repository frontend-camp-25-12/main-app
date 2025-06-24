import { electronAPI } from '@electron-toolkit/preload'
import { ipcApi } from './generated/ipc-api-main'

// @ts-ignore
window.electron = electronAPI
// @ts-ignore
window.ipcApi = ipcApi