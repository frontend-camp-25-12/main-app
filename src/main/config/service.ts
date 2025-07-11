import Store from 'electron-store';

import { PluginMetadata } from '../../share/plugins/type';
import './app/index'
import { pluginConfigFolder } from './type.d';
import { SyncStore } from './syncStore';

type StoreRecord = Record<string, any>;
type StoreType = SyncStore<StoreRecord>;
/**
 * 向插件提供的配置管理器
 */
class StoreManager {
  private storeMap: Map<string, StoreType>;

  constructor() {
    this.storeMap = new Map<string, StoreType>();
  }

  getStore(id: PluginMetadata['id']) {
    if (this.storeMap.has(id)) {
      return this.storeMap.get(id)!;
    }
    const store = new Store<StoreRecord>({
      name: id,
      cwd: pluginConfigFolder
    });
    this.storeMap.set(id, store);
    return store;
  }

  get(id: PluginMetadata['id'], key: string, defalut: any) {
    return this.getStore(id).get(key, defalut);
  }

  set(id: PluginMetadata['id'], key: string, value: any) {
    this.getStore(id).set(key, value);
  }
}

export const configManager = new StoreManager();