import axios, { AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { userManager } from '../user';
export const HOST = 'localhost:8080';
const BASE_URL = `http://${HOST}/api/`;
const BASE_URL_PLUGIN = `http://${HOST}/plugin/`;

class AuthApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }
  private setupInterceptors() {
    // 添加jwt
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = userManager.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // token过期处理
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // 通知用户管理器处理认证失效
            const newToken = await userManager.handleAuthFailure();

            if (newToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              return this.client.request(originalRequest);
            }
          } catch (refreshError) {
            // 认证处理失败，直接抛出错误
            throw refreshError;
          }
        }

        throw error;
      }
    );
  }
  getClient(): AxiosInstance {
    return this.client;
  }
}

// 无需认证的api实例
export const publicClient = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const pluginDownloadClient = axios.create({
  baseURL: BASE_URL_PLUGIN,
  timeout: 10000,
});

// 带认证的api实例
export const authClient = new AuthApiClient().getClient();
