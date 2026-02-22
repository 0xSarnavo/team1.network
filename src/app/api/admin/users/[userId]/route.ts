import { withAuth } from '@/lib/middleware/auth.middleware';
import { withAdminAccess } from '@/lib/middleware/permissions.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';
import { z } from 'zod';

// GET /api/admin/users/[userId] — Get user detail
export const GET = withAuth(
  withAdminAccess(async (_req, { params }) => {
    try {
      const { userId } = params;
      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          regionMemberships: {
            include: { region: { select: { id: true, name: true, slug: true } } },
          },
          platformAdmin: true,
          moduleLead: true,
          skills: { include: { skill: true } },
          interests: { include: { interest: true } },
        },
      });

      if (!user) {
        return apiError({ code: 'NOT_FOUND', message: 'User not found', statusCode: 404 });
      }

      return apiSuccess({
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        level: user.level,
        totalXp: user.totalXp,
        isActive: user.isActive,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        platformRole: user.platformAdmin?.role || null,
        regions: user.regionMemberships.map(m => ({
          membershipId: m.id,
          regionId: m.region.id,
          regionName: m.region.name,
          regionSlug: m.region.slug,
          role: m.role,
          status: m.status,
          isActive: m.isActive,
        })),
        moduleLeads: user.moduleLead.map(l => ({ module: l.module, isActive: l.isActive })),
        skills: user.skills.map(s => s.skill.name),
        interests: user.interests.map(i => i.interest.name),
      });
    } catch (error) {
      return apiError(error);
    }
  })
);

const assignRegionSchema = z.object({
  action: z.enum(['assign_region', 'remove_region', 'change_region_role', 'toggle_active']),
  regionId: z.string().uuid().optional(),
  role: z.string().optional(),
});

// PUT /api/admin/users/[userId] — Admin actions on user
export const PUT = withAuth(
  withAdminAccess(async (req, { user, params }) => {
    try {
      const { userId } = params;
      const body = await req.json();
      const data = assignRegionSchema.parse(body);

      if (data.action === 'assign_region' && data.regionId) {
        const existing = await db.userRegionMembership.findUnique({
          where: { userId_regionId: { userId, regionId: data.regionId } },
        });
        if (existing) {
          await db.userRegionMembership.update({
            where: { id: existing.id },
            data: { role: data.role || 'lead', status: 'accepted', isActive: true, acceptedAt: new Date() },
          });
        } else {
          await db.userRegionMembership.create({
            data: {
              userId,
              regionId: data.regionId,
              role: data.role || 'lead',
              status: 'accepted',
              acceptedAt: new Date(),
            },
          });
        }
        return apiSuccess({ message: 'Region assigned' });
      }

      if (data.action === 'remove_region' && data.regionId) {
        await db.userRegionMembership.deleteMany({
          where: { userId, regionId: data.regionId },
        });
        return apiSuccess({ message: 'Region removed' });
      }

      if (data.action === 'change_region_role' && data.regionId && data.role) {
        await db.userRegionMembership.updateMany({
          where: { userId, regionId: data.regionId },
          data: { role: data.role },
        });
        return apiSuccess({ message: 'Region role updated' });
      }

      if (data.action === 'toggle_active') {
        const targetUser = await db.user.findUnique({ where: { id: userId } });
        if (!targetUser) return apiError({ code: 'NOT_FOUND', message: 'User not found', statusCode: 404 });
        await db.user.update({
          where: { id: userId },
          data: { isActive: !targetUser.isActive },
        });
        return apiSuccess({ message: `User ${targetUser.isActive ? 'deactivated' : 'activated'}` });
      }

      return apiError({ code: 'VALIDATION_ERROR', message: 'Invalid action', statusCode: 422 });
    } catch (error) {
      return apiError(error);
    }
  })
);
