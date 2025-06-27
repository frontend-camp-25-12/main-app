
export interface HotkeyOption {
  id: string; // 插件id
  code: string; // feature code
  label: string; // feature label
  pluginName: string; // 插件名称
  boundHotkey?: string; // 当前绑定的热键
}
