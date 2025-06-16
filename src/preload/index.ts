import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {}

// @ts-ignore
window.electron = electronAPI
// @ts-ignore
window.api = api