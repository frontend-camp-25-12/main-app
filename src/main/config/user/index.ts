import { configFolder } from "../type.d";
import Store from 'electron-store';

export interface UserStoreSchema {
  userName: string; // 用户名
  authRefreshToken: string; // 加密后的刷新token
}

/**
 * 用户状态管理
 */
export const UserStore = new Store<UserStoreSchema>({
  name: 'user',
  cwd: configFolder
})