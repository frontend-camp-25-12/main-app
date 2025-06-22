/**
 * 编写“内置”的插件的plugins.json
 */

import { PluginMetadata } from "../../share/plugins/type";

export const builtinPlugins: PluginMetadata[] = [
  {
    id: 'builtin.entrance',
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
    id: 'builtin.settings',
    name: '设置',
    version: '1.0.0',
    dist: 'settings',
    internal: {}
  },
  {
    id: 'builtin.settings2',
    name: '插件商店',
    version: '1.0.0',
    dist: 'settings',
    internal: {}
  }
] as const