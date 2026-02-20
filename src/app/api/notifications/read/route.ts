import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { notificationService } from '@/lib/services/notification.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';

const markReadSchema = z.object({
  ids: z.array(z.string().uuid()).optional(),
  all: z.boolean().optional(),
});

// ============================================================
// POST /api/notifications/read
// Mark notifications as read
// ============================================================

export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { ids, all } = markReadSchema.parse(body);

    if (all) {
      await notificationService.markAllAsRead(user.id);
    } else if (ids && ids.length > 0) {
      await notificationService.markAsRead(user.id, ids);
    }

    return apiSuccess({ message: 'Marked as read' });
  } catch (error) {
    return apiError(error);
  }
});
