export interface HotkeyConfigSchema {
  hotkeys: Array<{
    id: string; // 插件id
    code: string; // plugin.json中的feature code
    hotkey: string; // 绑定的热键
  }>;
  inited: boolean;
}
