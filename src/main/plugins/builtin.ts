/**
 * 编写“内置”的插件的plugins.json
 */

import { PluginMetadata, PluginRuntimeInfo } from '../../share/plugins/type'
import type { PluginManager } from './loader'

export enum BuiltinPluginId {
  ENTRANCE = 'builtin.entrance',
  SETTINGS = 'builtin.settings',
  PLUGINSTORE = 'builtin.pluginStore',
  HOTKEYS = 'builtin.hotkeys',
  USER_DEV = 'builtin.userDev',
  FLOAT_BUTTON = 'builtin.floatButton',
  OPEN_TERMINAL = 'builtin.openTerminal',
}
/**
 * 内置插件的元数据
 * 
 * 对于logo，放置于src/renderer/src/public/icon/下
 * 然后在logo中直接给出文件名
 * @see PluginManager.resolveLogo
 */
export const builtinPlugins: PluginRuntimeInfo[] = [
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
      closeOnBlur: true,
      skipTaskbar: true,
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
    i18n: {
      'en': {
        name: 'Settings',
        description: 'Manage application settings'
      }
    },
    version: '1.0.0',
    dist: 'settings',
    logo: 'icon-settings.png',
    internal: {}
  },
  {
    id: BuiltinPluginId.HOTKEYS,
    name: '插件快捷键',
    description: '可配置所有快捷键功能的映射',
    i18n: {
      'en': {
        name: 'Hotkeys',
        description: 'Configure all hotkey mappings'
      }
    },
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
    name: '插件中心',
    description: '浏览和获取各种实用插件，管理已安装的插件',
    i18n: {
      'en': {
        name: 'Plugin Center',
        description: 'Browse and get various useful plugins, manage installed plugins'
      }
    },
    version: '1.0.0',
    logo: 'icon-plugin-store.png',
    window: {
    },
    dist: 'pluginStore',
    internal: {}
  },
  // {
  //   id: BuiltinPluginId.USER_DEV,
  //   name: '用户系统测试',
  //   version: '1.0.0',
  //   dist: 'userDev',
  //   internal: {},
  // },
  {
    id: BuiltinPluginId.FLOAT_BUTTON,
    name: '',  // 由于当前electron的issue，无框透明窗口仍会有标题栏，只能用空名称来“降低”视觉干扰。https://github.com/electron/electron/pull/47386
    version: '1.0.0',
    dist: 'floatButton',
    internal: {
      hidden: true
    },
    window: {
      width: 50,
      height: 50,
      resizable: false,
      frame: false,
      skipTaskbar: true,
      transparent: true,
      alwaysOnTop: true,
      disableTransition: true,
    }
  },
  {
    id: BuiltinPluginId.OPEN_TERMINAL,
    name: '系统终端',
    description: '快速访问终端命令行',
    i18n: {
      'en': {
        name: 'Open Terminal',
        description: 'Quick access to terminal command line'
      }
    },
    version: '1.0.0',
    dist: 'openTerminal',
    logo: 'icon-terminal.png',
    internal: {
    },
    window: {
      transparent: true,
      frame: false,
      disableTransition: true,
      resizable: false,
      width: 1,
      height: 1,
      skipTaskbar: true
    },
    features: [
      {
        code: 'open',
        label: '打开终端',
        i18n: {
          'en': {
            label: 'Open Terminal'
          }
        },
        hotKey: true,
        cmds: [
          "terminal"
        ]
      },
      {
        code: 'run',
        label: '在终端中运行',
        i18n: {
          'en': {
            label: 'Run in Terminal'
          }
        },
        cmds: [
          { type: 'any' }
        ]
      }
    ]
  }
] as PluginMetadata[]
