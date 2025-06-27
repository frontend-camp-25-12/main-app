/**
 * 编写“内置”的插件的plugins.json
 */

import { PluginMetadata } from "../../share/plugins/type";

export enum BuiltinPluginId {
  ENTRANCE = 'builtin.entrance',
  SETTINGS = 'builtin.settings'
}

export const builtinPlugins: PluginMetadata[] = [
  {
    id: BuiltinPluginId.ENTRANCE,
    name: '插件入口',
    version: '1.0.0',
    dist: 'entrance',
    internal: {
      hidden: true
    },
    window: {
      disableTransition: true,
      height: 360
    }
  },
  {
    id: BuiltinPluginId.SETTINGS,
    name: '设置',
    version: '1.0.0',
    dist: 'settings',
    logoPath: '../../resources/icon-settings.png',
    internal: {}
  }
] as const
