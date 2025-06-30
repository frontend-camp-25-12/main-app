import { authClient, publicClient } from './index';
import { 
  AuthResponse, 
  RegisterRequest, 
  LoginRequest, 
  RegisterResponse,
  LoginResponse,
  RefreshTokenResponse,
  UserMeResponse
} from './index.d';

class AuthApi {
  async register(data: RegisterRequest): Promise<AuthResponse<RegisterResponse>> {
    const response = await publicClient.post<AuthResponse<RegisterResponse>>('auth/register', data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse<LoginResponse>> {
    const response = await publicClient.post<AuthResponse<LoginResponse>>('auth/login', data);
    return response.data;
  }

  async getCurrentUser(): Promise<AuthResponse<UserMeResponse>> {
    const response = await authClient.get<AuthResponse<UserMeResponse>>('auth/me');
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse<RefreshTokenResponse>> {
    const response = await publicClient.post<AuthResponse<RefreshTokenResponse>>(
      'auth/refresh-token', 
      { refreshToken }
    );
    return response.data;
  }
}


export const authApi = new AuthApi();