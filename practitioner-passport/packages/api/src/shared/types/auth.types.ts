export type Role = "student" | "mentor" | "teacher";

export interface UserEntity {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  studentId?: string;
  passwordHash?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface PendingSignupEntity {
  token: string;
  fullName: string;
  email: string;
  role: Role;
  studentId?: string;
  passwordHash?: string;
  webBaseUrl?: string;
  createdAt: string;
  expiresAt: string;
}

export interface AuthenticatedUserPayload {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  studentId: string;
  isAuthenticated: true;
}
