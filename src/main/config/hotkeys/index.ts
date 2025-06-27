import { configFolder } from "../type.d";
import { HotkeyConfigSchema } from "./schema";
import Store from 'electron-store';

export const HotkeyConfig = new Store<HotkeyConfigSchema>({
  name: 'hotkey',
  cwd: configFolder,
  defaults: {
    inited: false,
    hotkeys: []
  }
})
