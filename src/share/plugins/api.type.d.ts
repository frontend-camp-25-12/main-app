
export interface PluginEnterAction {
  /**
   * 功能代码
   */
  code: string;
  /**
   * 用户的输入
   */
  payload: string;
  /**
   * 触发方式：快捷键、命令输入或插件入口
   */
  from: 'hotkey' | 'cmd' | 'menu'
}

/**
 * 本文件中定义了所有插件API会涉及的类型。
 */