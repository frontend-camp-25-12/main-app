import { app, globalShortcut } from "electron";
import { HotkeyConfig } from "../config/hotkeys";
import { BuiltinPluginId } from "./builtin";
import { pluginManager } from "./loader";
import { HotkeyOption } from "../../share/plugins/hotkeys.type";
import { PluginMetadata } from "../../share/plugins/type";
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

  private registerGlobalShortcut(option: HotkeyOption) {
    if (!option.boundHotkey) {
      return;
    }
    console.debug(`Registering hotkey: ${option.boundHotkey} for ${option.id} - ${option.code}`);
    globalShortcut.register(option.boundHotkey, () => {
      pluginManager.open(option.id, {
        code: option.code,
        payload: '',
        from: 'hotkey',
      });
    });
  }

  private unregisterGlobalShortcut(hotkey?: string) {
    if (hotkey && globalShortcut.isRegistered(hotkey)) {
      console.debug(`Unregistering hotkey: ${hotkey}`);
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
      this.registerGlobalShortcut(opt);
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
   * 处理插件的热键注册
   */
  add(plugin: PluginMetadata) {
    if (!plugin.features || plugin.disabled) return;
    for (const feature of plugin.features) {
      if (feature.hotKey) {
        this.registerHotkeyOption(plugin.id, feature.code, feature.label, plugin.name);
      }
    }
  }

  /**
   * 注册热键可选项
   * @param id 插件id
   * @param code feature code
   * @param label feature label
   * @param pluginName 插件名称
   */
  private registerHotkeyOption(id: string, code: string, label: string, pluginName: string) {
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
        option.boundHotkey = hotkey;
        this.registerGlobalShortcut(option);
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

  openHotkeySettings(id: string, code: string) {
    pluginManager.open(BuiltinPluginId.HOTKEYS, {
      payload: JSON.stringify({ id, code }),
      code: 'open',
      from: 'cmd'
    });
  }

  /**
   * 禁用插件的热键配置
   * @param pluginId 插件id
   */
  disable(pluginId: string) {
    for (const [_key, option] of this.configuredHotkeys) {
      if (option.id === pluginId) {
        this.unregisterGlobalShortcut(option.boundHotkey);
      }
    }
  }

  /**
   * 启用插件的热键绑定
   * @param plugin
   */
  enable(pluginId: string) {
    for (const [_key, option] of this.configuredHotkeys) {
      if (option.id === pluginId && option.boundHotkey) {
        this.registerGlobalShortcut(option);
      }
    }
  }

  /**
   * 移除插件的热键配置
   * @param pluginId 插件id
   */
  remove(pluginId: string) {
    this.disable(pluginId);
    for (const [key, option] of this.configuredHotkeys) {
      if (option.id === pluginId) {
        this.configuredHotkeys.delete(key);
      }
    }
    // 更新配置文件
    const config = this.listBoundHotkeys().map(opt => ({
      id: opt.id,
      code: opt.code,
      hotkey: opt.boundHotkey,
    }));
    HotkeyConfig.set('hotkeys', config);
  }
}

export const hotkeyManager = new HotkeyManager();