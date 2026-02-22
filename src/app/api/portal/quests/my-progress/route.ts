import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/quests/my-progress — Get current user's quest progress
export const GET = withAuth(async (_req, { user }) => {
  try {
    const progress = await portalService.getMyQuestProgress(user.id);
    return apiSuccess(progress);
  } catch (error) {
    return apiError(error);
  }
});
