/**
 * 编写“内置”的插件的plugins.json
 */

import { PluginMetadata, PluginRuntimeInfo } from '../../share/plugins/type'
import type { PluginManager } from './loader'

export enum BuiltinPluginId {
  ENTRANCE = 'builtin.entrance',
  SETTINGS = 'builtin.settings',
  PLUGINSTORE = 'builtin.pluginStore',
  HOTKEYS = 'builtin.hotkeys'
}
/**
 * 内置插件的元数据
 * 
 * 对于logo，放置于src/renderer/src/public/icon/下
 * 然后在logo中直接给出文件名
 * @see PluginManager.resolveLogo
 */
export const builtinPlugins: PluginRuntimeInfo[]  = [
  {
    id: BuiltinPluginId.ENTRANCE,
    name: '插件入口',
    version: '1.0.0',
    dist: 'entrance',
    logo: 'icon-app-drawer.png',
    internal: {
      hidden: true
    },
    window: {
      disableTransition: true,
      height: 400,
      resizable: false,
      frame: false,
      closeOnBlur: true
    },
    background: true,
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
    logo: 'icon-settings.png',
    internal: {}
  },
  {
    id: BuiltinPluginId.HOTKEYS,
    name: '插件快捷键',
    description: '可配置所有快捷键功能的映射',
    version: '1.0.0',
    window: {
      width: 700
    },
    dist: 'hotkeys',
    internal: {},
    logo: 'icon-hotkeys.png',
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
] as PluginMetadata[]
