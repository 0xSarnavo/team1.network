import { withAuth } from '@/lib/middleware/auth.middleware';
import { withAdminAccess } from '@/lib/middleware/permissions.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';

// GET /api/admin/stats — Super admin dashboard stats
export const GET = withAuth(
  withAdminAccess(async () => {
    try {
      const [
        totalUsers,
        activeUsers,
        totalRegions,
        totalMembers,
        pendingMembers,
        totalEvents,
        totalQuests,
        totalGuides,
        pendingSubmissions,
      ] = await Promise.all([
        db.user.count(),
        db.user.count({ where: { isActive: true } }),
        db.region.count({ where: { isActive: true } }),
        db.userRegionMembership.count({ where: { status: 'accepted', isActive: true } }),
        db.userRegionMembership.count({ where: { status: 'pending' } }),
        db.portalEvent.count(),
        db.portalQuest.count({ where: { isActive: true } }),
        db.portalGuide.count({ where: { status: 'published' } }),
        db.questSubmission.count({ where: { status: 'pending' } }),
      ]);

      // Recent users
      const recentUsers = await db.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, displayName: true, email: true, avatarUrl: true, createdAt: true },
      });

      // Regions with member counts
      const regions = await db.region.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: { select: { memberships: { where: { status: 'accepted', isActive: true } } } },
        },
      });

      return apiSuccess({
        stats: {
          totalUsers,
          activeUsers,
          totalRegions,
          totalMembers,
          pendingMembers,
          totalEvents,
          totalQuests,
          totalGuides,
          pendingSubmissions,
        },
        recentUsers,
        regions: regions.map(r => ({
          id: r.id, name: r.name, slug: r.slug, memberCount: r._count.memberships,
        })),
      });
    } catch (error) {
      return apiError(error);
    }
  })
);
