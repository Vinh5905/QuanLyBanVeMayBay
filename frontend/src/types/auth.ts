export type Role = 'Admin' | 'Staff' | 'Agent' | 'User';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  fullName?: string;
}

export interface AuthResponse {
  status: string;
  code: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    userInfo: AuthUser;
  };
}
