import { ShallowRef, shallowRef } from "vue"
import { PluginMetadata } from "../../../../../share/plugins/type"

export let installedPkg: ShallowRef<Record<string, PluginMetadata>> = shallowRef(await window.ipcApi.pluginList())

window.ipcApi.onPluginListChange(async () => {
  installedPkg.value = await window.ipcApi.pluginList()
})