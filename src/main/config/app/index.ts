import { configFolder } from "../type.d";
import { ConfigSchema } from "./schema";
import Store from 'electron-store';

/**
 * 应用内的配置管理
 */
export const AppConfig = new Store<ConfigSchema>({
  name: 'app',
  cwd: configFolder
})

AppConfig.store