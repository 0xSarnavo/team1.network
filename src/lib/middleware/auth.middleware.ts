import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import db from '@/lib/db/client';
import { apiError } from '@/lib/helpers/api-response';
import { AppError } from '@/lib/helpers/errors';
import type { AuthUser, TokenPayload } from '@/types/api.types';

// ============================================================
// Auth Middleware
// ============================================================

interface AuthenticatedContext {
  params: Record<string, string>;
  user: AuthUser;
}

type AuthenticatedHandler = (
  req: NextRequest,
  context: AuthenticatedContext
) => Promise<NextResponse>;

/**
 * Wraps an API route handler with authentication.
 * Extracts JWT from Authorization header, validates it,
 * loads full user context including admin roles and permissions.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    try {
      // Extract token from Authorization header
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return apiError(new AppError('UNAUTHORIZED', 'Authentication required'));
      }

      const token = authHeader.slice(7);
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }

      // Verify JWT
      let payload: TokenPayload;
      try {
        payload = jwt.verify(token, jwtSecret) as TokenPayload;
      } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
          return apiError(new AppError('TOKEN_EXPIRED', 'Access token expired'));
        }
        return apiError(new AppError('TOKEN_INVALID', 'Invalid access token'));
      }

      // Load user with roles and permissions
      const user = await loadUserContext(payload.userId);
      if (!user) {
        return apiError(new AppError('UNAUTHORIZED', 'User not found'));
      }

      if (!user.isActive) {
        return apiError(new AppError('ACCOUNT_DEACTIVATED', 'Account is deactivated'));
      }

      // Build AuthUser object
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        level: user.level,
        totalXp: user.totalXp,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted,
        platformRole: user.platformAdmin?.role ?? null,
        moduleRoles: buildModuleRoles(user.moduleLead),
        modulePermissions: {}, // TODO: load from module team permissions tables
      };

      return handler(req, { params: context.params, user: authUser });
    } catch (error) {
      console.error('Auth middleware error:', error);
      return apiError(new AppError('INTERNAL_ERROR', 'Authentication failed'));
    }
  };
}

/**
 * Optional auth — does not fail if no token, but loads user if present.
 */
export function withOptionalAuth(
  handler: (req: NextRequest, context: { params: Record<string, string>; user: AuthUser | null }) => Promise<NextResponse>
) {
  return async (req: NextRequest, context: { params: Record<string, string> }) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return handler(req, { params: context.params, user: null });
    }

    const token = authHeader.slice(7);
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return handler(req, { params: context.params, user: null });
    }

    try {
      const payload = jwt.verify(token, jwtSecret) as TokenPayload;
      const user = await loadUserContext(payload.userId);

      if (!user || !user.isActive) {
        return handler(req, { params: context.params, user: null });
      }

      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        username: user.username,
        avatarUrl: user.avatarUrl,
        level: user.level,
        totalXp: user.totalXp,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted,
        platformRole: user.platformAdmin?.role ?? null,
        moduleRoles: buildModuleRoles(user.moduleLead),
        modulePermissions: {},
      };

      return handler(req, { params: context.params, user: authUser });
    } catch {
      return handler(req, { params: context.params, user: null });
    }
  };
}

// ============================================================
// Helpers
// ============================================================

async function loadUserContext(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    include: {
      platformAdmin: true,
      moduleLead: { where: { isActive: true } },
    },
  });
}

function buildModuleRoles(leads: Array<{ module: string; isActive: boolean }>): Record<string, string> {
  const roles: Record<string, string> = {};
  for (const lead of leads) {
    if (lead.isActive) {
      roles[lead.module] = 'lead';
    }
  }
  return roles;
}
