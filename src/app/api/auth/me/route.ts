import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess } from '@/lib/helpers/api-response';

// ============================================================
// GET /api/auth/me
// Get current authenticated user
// ============================================================

export const GET = withAuth(async (_req, { user }) => {
  return apiSuccess({ user });
});
