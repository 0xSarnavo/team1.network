import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { authService } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';

// ============================================================
// GET /api/auth/sessions
// List active sessions for current user
// ============================================================

export const GET = withAuth(async (_req, { user }) => {
  const sessions = await db.authSession.findMany({
    where: { userId: user.id, isActive: true },
    select: {
      id: true,
      ipAddress: true,
      userAgent: true,
      deviceName: true,
      createdAt: true,
      expiresAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return apiSuccess({ sessions });
});

// ============================================================
// DELETE /api/auth/sessions
// Logout all sessions
// ============================================================

export const DELETE = withAuth(async (_req, { user }) => {
  try {
    await authService.logoutAllSessions(user.id);
    return apiSuccess({ message: 'All sessions terminated' });
  } catch (error) {
    return apiError(error);
  }
});
