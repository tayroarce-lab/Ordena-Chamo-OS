import type { Usuario } from './usuario';

export interface LoginCredentials {
  telefono: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  usuario: Usuario;
}

export interface AuthMeResponse {
  success: boolean;
  usuario: Usuario;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
}
