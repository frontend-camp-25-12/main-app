import Store from 'electron-store';
type StoreRecord = Record<string, string>
type StoreType = Store<StoreRecord>

import { PluginMetadata } from '../../share/plugins/type';
import { ConfigSchema } from './schema';

const configFolder = './config';
const pluginConfigFolder = configFolder + '/plugins';


/**
 * 向插件提供的配置管理器
 */
class StoreManager{
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

  get(id: PluginMetadata['id'], key: string, defalut: string) {
    return this.getStore(id).get(key, defalut);
  }

  set(id: PluginMetadata['id'], key: string, value: string) { 
    this.getStore(id).set(key, value);
   }
}

export const configManager = new StoreManager();

/**
 * 应用内的配置管理
 */
export const AppConfig = new Store<ConfigSchema>({
  name: 'app',
  cwd: configFolder
})