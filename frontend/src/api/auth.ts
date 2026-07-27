export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserResponse {
  id: number;
  email: string;
}

export async function login(_data: LoginRequest): Promise<TokenResponse> {
  throw new Error("not implemented");
}

export async function register(_data: RegisterRequest): Promise<UserResponse> {
  throw new Error("not implemented");
}
