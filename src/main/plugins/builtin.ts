/**
 * 编写“内置”的插件的plugins.json
 */

import { PluginMetadata } from "../../share/plugins/type";

export enum BuiltinPluginId {
  ENTRANCE = 'builtin.entrance',
  SETTINGS = 'builtin.settings',
  HOTKEYS = 'builtin.hotkeys',
}

export const builtinPlugins: PluginMetadata[] = [
  {
    id: BuiltinPluginId.ENTRANCE,
    name: '插件入口',
    version: '1.0.0',
    dist: 'entrance',
    logoPath: '../../resources/icon-app-drawer.png',
    internal: {
      hidden: true
    },
    window: {
      disableTransition: true,
      height: 360
    },
    features: [{
      code: 'open',
      label: '打开插件面板',
      hotKey: true,
      cmds: []
    }]
  },
  {
    id: BuiltinPluginId.SETTINGS,
    name: '设置',
    version: '1.0.0',
    dist: 'settings',
    logoPath: '../../resources/icon-settings.png',
    internal: {}
  },
  {
    id: BuiltinPluginId.HOTKEYS,
    name: '快捷键映射',
    version: '1.0.0',
    window: {
      width: 600,
    },
    dist: 'hotkeys',
    internal: {},
    logoPath: '../../resources/icon-hotkeys.png'
  }
] as const
