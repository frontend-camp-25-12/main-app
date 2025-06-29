import { PluginMetadata } from "../../../share/plugins/type";
import { configFolder } from "../type.d";
import Store from 'electron-store';

export interface PluginUsageInfoSchema {
  info: {
    id: PluginMetadata['id'];
    installedAt: number; // 插件安装时间戳
    usedAt: number; // 插件上次使用时间戳
  }[]
}

export const PluginUsageInfo = new Store<PluginUsageInfoSchema>({
  name: 'pluginUsageInfo',
  cwd: configFolder
})