import { BASE_URL } from "./client";

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

export interface AuthResponse {
  user: UserResponse;
  access_token: string;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Ungültige E-Mail oder Passwort");
    }
    throw new Error(`Login fehlgeschlagen (${response.status})`);
  }
  return response.json();
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 409) {
      throw new Error("Diese E-Mail-Adresse ist bereits registriert");
    }
    throw new Error(`Registrierung fehlgeschlagen (${response.status})`);
  }
  return response.json();
}
