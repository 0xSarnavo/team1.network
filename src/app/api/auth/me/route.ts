import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';

// ============================================================
// GET /api/auth/me
// Get current authenticated user
// ============================================================

export const GET = withAuth(async (_req, { user }) => {
  // Fetch bio from DB since AuthUser doesn't include it
  const fullUser = await db.user.findUnique({
    where: { id: user.id },
    select: { bio: true },
  });

  // Map platformRole/moduleRoles to adminRoles shape the frontend expects
  const isSuperAdmin = user.platformRole === 'super_admin';
  const isSuperSuperAdmin = user.platformRole === 'super_super_admin';
  const moduleLeads = user.moduleRoles ? Object.keys(user.moduleRoles) : [];

  return apiSuccess({
    id: user.id,
    email: user.email,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: fullUser?.bio || null,
    level: user.level,
    totalXp: user.totalXp,
    onboardingCompleted: user.onboardingCompleted,
    adminRoles: (isSuperAdmin || isSuperSuperAdmin || moduleLeads.length > 0) ? {
      isSuperAdmin,
      isSuperSuperAdmin,
      moduleLeads,
    } : undefined,
  });
});
