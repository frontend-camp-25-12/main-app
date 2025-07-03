import { ref } from "vue"

export const downloadProgress = ref<Record<string, number>>({})
window.ipcApi.onPluginDownloadProgress((progress, pluginId) => {
  downloadProgress.value[pluginId] = progress
  if (progress === 100) {
    setTimeout(() => {
      delete downloadProgress.value[pluginId]
    }, 200)
  }
})