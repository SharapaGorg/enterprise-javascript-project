import type { User } from '@supabase/supabase-js';

export interface AuthError {
  message: string;
  status?: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  confirmPassword?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: AuthError | null;
}

export interface AuthResponse {
  user: User | null;
  session: any;
  error?: AuthError;
}

