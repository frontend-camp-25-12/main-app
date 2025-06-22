import { ElectronAPI } from '@electron-toolkit/preload'
import { IpcApi } from './generated/ipc-api'

declare global {
  interface Window {
    electron: ElectronAPI
    ipcApi: IpcApi
  }
}
