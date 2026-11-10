export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'PASSAGER' | 'CONDUCTEUR' | 'ADMIN';
  avatar?: string;
  city?: string;
  bio?: string;
  rating?: number;
  tripsCount?: number;
  isActive: boolean;
  isVerified?: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  city?: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
