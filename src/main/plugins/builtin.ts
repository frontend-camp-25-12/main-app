/**
 * 编写“内置”的插件的plugins.json
 */

import { PluginMetadata } from '../../share/plugins/type'

export enum BuiltinPluginId {
  ENTRANCE = 'builtin.entrance',
  SETTINGS = 'builtin.settings',
  PLUGINSTORE = 'builtin.pluginStore',
  HOTKEYS = 'builtin.hotkeys'
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
      height: 400,
      resizable: false
    },
    features: [
      {
        code: 'open',
        label: '打开插件面板',
        hotKey: true,
        cmds: []
      }
    ]
  },
  {
    id: BuiltinPluginId.SETTINGS,
    name: '设置',
    description: '管理应用本身的设置',
    version: '1.0.0',
    dist: 'settings',
    logoPath: '../../resources/icon-settings.png',
    internal: {}
  },
  {
    id: BuiltinPluginId.HOTKEYS,
    name: '插件快捷键',
    description: '可配置所有快捷键功能的映射',
    version: '1.0.0',
    window: {
      width: 600
    },
    dist: 'hotkeys',
    internal: {},
    logoPath: '../../resources/icon-hotkeys.png',
    features: [
      {
        code: 'open',
        label: '转到快捷键映射',
        searchable: false,
        cmds: []
      }
    ]
  },
  {
    id: BuiltinPluginId.PLUGINSTORE,
    name: '插件市场',
    version: '1.0.0',
    window: {
      width: 800
    },
    dist: 'pluginStore',
    internal: {}
  }
] as const
