import { app, globalShortcut } from "electron";
import { HotkeyConfig } from "../config/hotkeys";
import { BuiltinPluginId } from "./builtin";
import { pluginManager } from "./loader";
import { HotkeyOption } from "../../share/plugins/hotkeys.type";

/**
 * 热键管理器
 */
export class HotkeyManager {
  private configuredHotkeys: Map<string, HotkeyOption> = new Map(); // key: ${id}_${code}, value: HotkeyOption

  constructor() {
    app.whenReady().then(() => {
      this.initConfig();
      this.initDefault();
      this.bindHotkeys();
    })
  }

  private registerGlobalShortcut(hotkey: string, option: HotkeyOption) {
    console.debug(`Registering hotkey: ${hotkey} for ${option.id} - ${option.code}`);
    globalShortcut.register(hotkey, () => {
      pluginManager.open(option.id, {
        code: option.code,
        payload: '',
        from: 'hotkey',
      });
    });
  }

  private unregisterGlobalShortcut(hotkey?: string) {
    console.debug(`Unregistering hotkey: ${hotkey}`);
    if (hotkey && globalShortcut.isRegistered(hotkey)) {
      globalShortcut.unregister(hotkey);
    }
  }

  private getBindingKey(id: string, code: string): string {
    return `${id}_${code}`;
  }

  private bindHotkeys() {
    this.listBoundHotkeys().forEach(opt => {
      if (!opt.boundHotkey) {
        return;
      }
      this.registerGlobalShortcut(opt.boundHotkey, opt);
    });
  }

  /**
   * 从配置文件中初始化已配置的热键
   */
  private initConfig() {
    const config = HotkeyConfig.get('hotkeys', []);
    for (const item of config) {
      const key = this.getBindingKey(item.id, item.code);
      this.configuredHotkeys.set(key, {
        id: item.id,
        code: item.code,
        label: '', // 需要在registerHotkeyOption中更新
        pluginName: '', // 需要在registerHotkeyOption中更新
        boundHotkey: item.hotkey,
      });
    }
  }

  /**
   * 初始化内置插件的默认热键
   */
  private initDefault() {
    const isFirstRun = HotkeyConfig.get('inited', false) === false;

    if (isFirstRun) {
      const builtinDefaults = [
        { id: BuiltinPluginId.ENTRANCE, code: 'open', hotkey: 'Alt+Shift+I' },
      ];

      // 写入默认配置
      HotkeyConfig.set('hotkeys', builtinDefaults);
      HotkeyConfig.set('inited', true);
      this.initConfig()
    }
  }

  /**
   * 注册热键可选项
   * @param id 插件id
   * @param code feature code
   * @param label feature label
   * @param pluginName 插件名称
   */
  registerHotkeyOption(id: string, code: string, label: string, pluginName: string) {
    const boundKey = this.getBindingKey(id, code);
    if (this.configuredHotkeys.has(boundKey)) {
      const existingOption = this.configuredHotkeys.get(boundKey);
      if (existingOption) {
        existingOption.label = label;
        existingOption.pluginName = pluginName;
      }
    } else {
      const newOption: HotkeyOption = {
        id,
        code,
        label,
        pluginName,
      };
      this.configuredHotkeys.set(boundKey, newOption);
    }
  }

  /**
   * 列出所有热键可选项
   */
  listHotkeyOptions(): HotkeyOption[] {
    return Array.from(this.configuredHotkeys.values());
  }

  /**
   * 仅列出已绑定的热键
   */
  listBoundHotkeys(): HotkeyOption[] {
    return this.listHotkeyOptions().filter(v => v.boundHotkey);
  }

  /**
   * 更新热键绑定
   * @param id 插件id
   * @param code feature code
   * @param hotkey 热键字符串，空字符串表示清除绑定
   */
  updateHotkeyBinding(id: string, code: string, hotkey: string) {
    const key = this.getBindingKey(id, code);
    const option = this.configuredHotkeys.get(key);

    if (option) {
      this.unregisterGlobalShortcut(option.boundHotkey);
      if (hotkey) {
        this.registerGlobalShortcut(hotkey, option);
        option.boundHotkey = hotkey;
      } else {
        option.boundHotkey = undefined;
      }
      // 更新配置文件
      const config =
        this.listBoundHotkeys().map(opt => ({
          id: opt.id,
          code: opt.code,
          hotkey: opt.boundHotkey,
        }));
      HotkeyConfig.set('hotkeys', config);
    }
  }
}

export const hotkeyManager = new HotkeyManager();