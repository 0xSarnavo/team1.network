import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { notificationService } from '@/lib/services/notification.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// ============================================================
// GET /api/notifications
// List notifications for current user
// ============================================================

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const unreadOnly = searchParams.get('unread') === 'true';

    const { notifications, total } = await notificationService.getNotifications(
      user.id, page, limit, unreadOnly
    );

    const pagination = getPaginationMeta(page, limit, total);
    return apiSuccess(notifications, pagination);
  } catch (error) {
    return apiError(error);
  }
});
