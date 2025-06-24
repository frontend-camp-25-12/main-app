import { ElectronAPI } from '@electron-toolkit/preload'
import { IpcApi } from './generated/ipc-api-main'

declare global {
  interface Window {
    electron: ElectronAPI
    ipcApi: IpcApi
  }
}
