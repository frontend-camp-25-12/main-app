import { AppConfigSchema } from "../../../share/plugins/type";
import { configFolder } from "../type.d";
import Store from 'electron-store';

/**
 * 应用内的配置管理
 */
export const AppConfig = new Store<AppConfigSchema>({
  name: 'app',
  cwd: configFolder
})