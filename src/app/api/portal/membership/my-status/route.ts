import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/membership/my-status — Get current user's membership status
export const GET = withAuth(async (_req, { user }) => {
  try {
    const status = await portalService.getMyMembershipStatus(user.id);
    return apiSuccess(status);
  } catch (error) {
    return apiError(error);
  }
});
