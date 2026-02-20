import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/helpers/api-response';
import { AppError } from '@/lib/helpers/errors';
import type { AuthUser } from '@/types/api.types';
import type { ModuleName } from '@/lib/config/permissions';

// ============================================================
// Permission Middleware
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
 * Check if user has permission for a specific module action.
 * Access hierarchy:
 *   1. SSA / SA → full access to everything
 *   2. Module Lead → full access to their module
 *   3. Team Member → specific permissions only
 */
export function withPermission(
  module: ModuleName,
  permission: string,
  handler: AuthenticatedHandler
): AuthenticatedHandler {
  return async (req: NextRequest, context: AuthenticatedContext) => {
    const { user } = context;

    // SSA and SA have all permissions
    if (
      user.platformRole === 'super_super_admin' ||
      user.platformRole === 'super_admin'
    ) {
      return handler(req, context);
    }

    // Module lead has all module permissions
    if (user.moduleRoles?.[module] === 'lead') {
      return handler(req, context);
    }

    // Team member — check specific permission
    if (user.modulePermissions?.[module]?.includes(permission)) {
      return handler(req, context);
    }

    return apiError(
      new AppError('FORBIDDEN', 'You do not have permission to perform this action')
    );
  };
}

/**
 * Check if user is any type of platform admin (SSA or SA).
 */
export function withAdminAccess(handler: AuthenticatedHandler): AuthenticatedHandler {
  return async (req: NextRequest, context: AuthenticatedContext) => {
    const { user } = context;

    if (
      user.platformRole === 'super_super_admin' ||
      user.platformRole === 'super_admin'
    ) {
      return handler(req, context);
    }

    return apiError(
      new AppError('FORBIDDEN', 'Admin access required')
    );
  };
}

/**
 * Check if user is SSA only.
 */
export function withSuperAdminAccess(handler: AuthenticatedHandler): AuthenticatedHandler {
  return async (req: NextRequest, context: AuthenticatedContext) => {
    const { user } = context;

    if (user.platformRole === 'super_super_admin') {
      return handler(req, context);
    }

    return apiError(
      new AppError('FORBIDDEN', 'Super Admin access required')
    );
  };
}
