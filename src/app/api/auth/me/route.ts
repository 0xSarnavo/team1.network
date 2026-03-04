import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';
import { portalService } from '@/lib/services/portal.service';

// ============================================================
// GET /api/auth/me
// Get current authenticated user
// ============================================================

export const GET = withAuth(async (_req, { user }) => {
  // Fetch bio + membership status in parallel
  const [fullUser, memberships] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { bio: true },
    }),
    portalService.getMyMembershipStatus(user.id),
  ]);

  // Find first accepted & active membership (earliest acceptedAt)
  const acceptedMemberships = memberships
    .filter(m => m.status === 'accepted' && m.isActive)
    .sort((a, b) => {
      if (!a.acceptedAt || !b.acceptedAt) return 0;
      return new Date(a.acceptedAt).getTime() - new Date(b.acceptedAt).getTime();
    });

  const isMember = acceptedMemberships.length > 0;
  const primaryRegionSlug = acceptedMemberships[0]?.regionSlug || null;

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
    isMember,
    primaryRegionSlug,
    adminRoles: (isSuperAdmin || isSuperSuperAdmin || moduleLeads.length > 0) ? {
      isSuperAdmin,
      isSuperSuperAdmin,
      moduleLeads,
    } : undefined,
  });
});
