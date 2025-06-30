import { safeStorage } from 'electron';
import { User } from "../share/plugins/type";
import { AuthTokens, UserInfo, RegisterRequest, LoginRequest } from "./api/index.d";
import { authApi } from "./api/auth";
import { UserStore } from './config/user';

class UserManager {
  private currentUser: User | undefined;
  private accessToken: string | undefined;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.loadUserFromConfig();
  }
  /**
   * 从配置中加载用户信息并尝试刷新token
   */
  private loadUserFromConfig() {
    const userName = UserStore.get('userName', '');
    if (userName) {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        // 启动时刷新
        this.performTokenRefresh()
      }
    }
  }

  /**
   * 获取当前用户信息
   */
  getCurrentUser(): User | undefined {
    return this.currentUser;
  }

  /**
   * 获取当前访问token
   */
  getAccessToken(): string | undefined {
    return this.accessToken;
  }

  /**
   * 获取加密存储的refresh token
   */
  getRefreshToken(): string | undefined {
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = UserStore.get('authRefreshToken', '');
        if (encrypted) {
          const buffer = Buffer.from(encrypted, 'base64');
          return safeStorage.decryptString(buffer);
        }
      }
    } catch (error) {
      console.error('Failed to decrypt refresh token:', error);
    }
    return undefined;
  }

  /**
   * 设置加密存储的refresh token
   * @param refreshToken 刷新token
   */
  private setRefreshToken(refreshToken: string): void {
    try {
      if (safeStorage.isEncryptionAvailable()) {
        const encrypted = safeStorage.encryptString(refreshToken);
        const base64 = encrypted.toString('base64');
        UserStore.set('authRefreshToken', base64);
      }
    } catch (error) {
      console.error('Failed to encrypt refresh token:', error);
    }
  }

  /**
   * 更新token信息
   * @param tokens token对象
   */
  updateTokens(tokens: AuthTokens): void {
    this.accessToken = tokens.token;
    this.setRefreshToken(tokens.refreshToken);
  }

  /**
   * 设置当前用户信息和token
   * @param userInfo 用户信息
   * @param tokens token对象
   */
  setUser(userInfo: UserInfo, tokens: AuthTokens): void {
    this.currentUser = {
      name: userInfo.username
    };
    this.updateTokens(tokens);
    UserStore.set('userName', userInfo.username);
  }

  /**
   * 注销当前用户
   */
  logout(): void {
    this.currentUser = undefined;
    this.accessToken = undefined;
    UserStore.set('userName', '');
    UserStore.set('auth_refresh_token', '');
  }

  /**
   * 判断用户是否已登录
   */
  isLoggedIn(): boolean {
    return !!this.currentUser && !!this.getRefreshToken();
  }

  /**
   * 注册新用户
   * @param data 注册请求参数
   * @returns 注册是否成功
   */
  async register(data: RegisterRequest): Promise<boolean> {
    try {
      const response = await authApi.register(data);

      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        this.setUser(user, { token, refreshToken });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  }

  /**
   * 用户登录
   * @param data 登录请求参数
   * @returns 登录是否成功
   */
  async login(data: LoginRequest): Promise<boolean> {
    try {
      const response = await authApi.login(data);

      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        this.setUser(user, { token, refreshToken });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }
  /**
   * 获取当前用户详细信息
   * @returns 当前用户信息
   */
  async getCurrentUserInfo(): Promise<User | undefined> {
    try {
      const response = await authApi.getCurrentUser();
      if (response.success && response.data) {
        const user = response.data.user;
        this.currentUser = {
          name: user.username
        };
        return this.currentUser;
      }

      return undefined;
    } catch (error) {
      console.error('Failed to get current user info:', error);
      return undefined;
    }
  }
  /**
   * 处理认证失效，尝试刷新token，避免并发刷新
   * @returns 新的访问token，刷新失败返回null
   */
  async handleAuthFailure(): Promise<string | null> {
    // 避免并发刷新token
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.refreshPromise = null;
    }
  }

  /**
   * 执行实际的token刷新操作
   * @returns 新的访问token，刷新失败返回null
   */
  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.logout();
        return null;
      }

      const response = await authApi.refreshToken(refreshToken);

      if (response.success && response.data) {
        this.updateTokens(response.data);
        return response.data.token;
      }

      // 刷新失败，清除用户状态
      this.logout();
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return null;
    }
  }
}

export const userManager = new UserManager();