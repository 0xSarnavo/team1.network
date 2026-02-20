import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { AppError } from '@/lib/helpers/errors';
import db from '@/lib/db/client';

// DELETE /api/auth/sessions/:sessionId — Revoke a specific session
export const DELETE = withAuth(async (_req, { params, user }) => {
  try {
    const session = await db.authSession.findFirst({
      where: { id: params.sessionId, userId: user.id },
    });

    if (!session) {
      throw new AppError('NOT_FOUND', 'Session not found');
    }

    await db.authSession.update({
      where: { id: params.sessionId },
      data: { isActive: false },
    });

    return apiSuccess({ message: 'Session revoked' });
  } catch (error) {
    return apiError(error);
  }
});
