import { withOptionalAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';

// GET /api/profile/:username/badges — User's badges
export const GET = withOptionalAuth(async (_req, { params, user }) => {
  try {
    const target = await db.user.findUnique({
      where: { username: params.username },
      select: { id: true },
    });
    if (!target) return apiError({ code: 'NOT_FOUND', message: 'User not found', statusCode: 404 });

    const isOwn = user?.id === target.id;

    const badges = await db.userBadge.findMany({
      where: { userId: target.id, ...(isOwn ? {} : { isClaimed: true }) },
      include: { badge: true },
      orderBy: [{ isPinned: 'desc' }, { pinOrder: 'asc' }, { unlockedAt: 'desc' }],
    });

    return apiSuccess(badges.map(ub => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      emoji: ub.badge.emoji,
      iconUrl: ub.badge.iconUrl,
      category: ub.badge.category,
      rarity: ub.badge.rarity,
      isPinned: ub.isPinned,
      isClaimed: ub.isClaimed,
      unlockedAt: ub.unlockedAt,
    })));
  } catch (error) {
    return apiError(error);
  }
});
