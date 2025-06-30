// 基础响应接口
export interface BaseResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

// 用户相关接口
export interface UserInfo {
  id: number;
  user_id: string;
  username: string;
}

// 认证Token接口
export interface AuthTokens {
  token: string;
  refreshToken: string;
}

// 请求接口
export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// 响应接口
export interface AuthData extends AuthTokens {
  user: UserInfo;
}

export interface RegisterResponse extends AuthData {}
export interface LoginResponse extends AuthData {}
export interface RefreshTokenResponse extends AuthTokens {}
export interface UserMeResponse {
  user: UserInfo;
}

// 类型别名，简化使用
export type AuthResponse<T = any> = BaseResponse<T>;
export type ApiError = Error;