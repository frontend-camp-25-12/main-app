import { ElectronAPI } from '@electron-toolkit/preload'
import { IpcApi } from './generated/ipc-api-main'
import { PlatformApi } from './generated/ipc-api-plugin'

declare global {
  interface Window {
    electron: ElectronAPI
    ipcApi: IpcApi
    platform: PlatformApi
    getPathForFile: (file: File) => string
  }
}
