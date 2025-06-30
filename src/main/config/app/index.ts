import { AppConfigSchema } from "../../../share/plugins/type";
import { configFolder } from "../type.d";
import { SyncStore } from "../syncStore";

/**
 * 应用内的偏好配置管理
 */
export const AppConfig = new SyncStore<AppConfigSchema>({
  name: 'app',
  cwd: configFolder
})