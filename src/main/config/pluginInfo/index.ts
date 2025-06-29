import {  PluginUsageInfoSchema } from "../../../share/plugins/type";
import { configFolder } from "../type.d";
import Store from 'electron-store';

export const PluginUsageInfo = new Store<PluginUsageInfoSchema>({
  name: 'pluginUsageInfo',
  cwd: configFolder
})