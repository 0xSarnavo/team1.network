// ============================================================
// API Request/Response Types
// ============================================================

import { PaginationMeta } from '@/lib/helpers/api-response';

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
  requires2fa?: boolean;
  tempToken?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
}

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  level: number;
  totalXp: number;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  platformRole?: 'super_super_admin' | 'super_admin' | null;
  moduleRoles?: Record<string, string>;
  modulePermissions?: Record<string, string[]>;
}

export interface TokenPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Upload types
export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  size: number;
  context: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileId: string;
  fileUrl: string;
}

// Notification types
export interface NotificationItem {
  id: string;
  module: string;
  type: string;
  title: string;
  body: string;
  actionUrl: string | null;
  actionLabel: string | null;
  isRead: boolean;
  createdAt: string;
}

// Generic paginated response
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: PaginationMeta;
}
