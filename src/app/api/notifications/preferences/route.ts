import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';
import { z } from 'zod';

// GET /api/notifications/preferences
export const GET = withAuth(async (_req, { user }) => {
  try {
    const prefs = await db.notificationPreference.findMany({
      where: { userId: user.id },
    });

    return apiSuccess(prefs.map(p => ({
      type: p.notificationType,
      email: p.channelEmail,
      inapp: p.channelInapp,
      push: p.channelPush,
    })));
  } catch (error) {
    return apiError(error);
  }
});

const prefsSchema = z.array(z.object({
  type: z.string().min(1).max(100),
  email: z.boolean().optional(),
  inapp: z.boolean().optional(),
  push: z.boolean().optional(),
}));

// PUT /api/notifications/preferences — Batch update
export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const prefs = prefsSchema.parse(body);

    for (const p of prefs) {
      await db.notificationPreference.upsert({
        where: {
          userId_notificationType: {
            userId: user.id,
            notificationType: p.type,
          },
        },
        update: {
          ...(p.email !== undefined && { channelEmail: p.email }),
          ...(p.inapp !== undefined && { channelInapp: p.inapp }),
          ...(p.push !== undefined && { channelPush: p.push }),
        },
        create: {
          userId: user.id,
          notificationType: p.type,
          channelEmail: p.email ?? true,
          channelInapp: p.inapp ?? true,
          channelPush: p.push ?? true,
        },
      });
    }

    return apiSuccess({ message: 'Preferences updated' });
  } catch (error) {
    return apiError(error);
  }
});
