/**
 * 编写“内置”的插件的plugins.json
 */

import { PluginMetadata, PluginRuntimeInfo } from '../../share/plugins/type'

export enum BuiltinPluginId {
  ENTRANCE = 'builtin.entrance',
  SETTINGS = 'builtin.settings',
  PLUGINSTORE = 'builtin.pluginStore',
  HOTKEYS = 'builtin.hotkeys'
}
/**
 * 内置插件的元数据
 * 对于logo，放置于src/renderer/src/public/icon/下
 * logo通过vite静态资源规则，转移到out/renderer/icon下。但主应用中通过文件系统（而不是vite接管的资源路径）获取Logo文件，
 * 所以需要写成相对于out/renderer/windows/entrance/index.html的相对路径格式
 */
export const builtinPlugins: PluginRuntimeInfo[]  = [
  {
    id: BuiltinPluginId.ENTRANCE,
    name: '插件入口',
    version: '1.0.0',
    dist: 'entrance',
    logoPath: '../../icon/icon-app-drawer.png',
    internal: {
      hidden: true
    },
    window: {
      disableTransition: true,
      height: 400,
      resizable: false
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
    logoPath: '../../icon/icon-settings.png',
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
    logoPath: '../../icon/icon-hotkeys.png',
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
