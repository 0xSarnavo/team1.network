import { withAuth } from '@/lib/middleware/auth.middleware';
import { notificationService } from '@/lib/services/notification.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// GET /api/notifications/count
// Get unread notification count
// ============================================================

export const GET = withAuth(async (_req, { user }) => {
  try {
    const count = await notificationService.getUnreadCount(user.id);
    return apiSuccess({ count });
  } catch (error) {
    return apiError(error);
  }
});
