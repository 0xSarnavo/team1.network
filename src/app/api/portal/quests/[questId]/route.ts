import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/quests/:questId — Quest detail
export const GET = withAuth(async (_req, { params, user }) => {
  try {
    const quest = await portalService.getQuestById(params.questId, user.id);
    return apiSuccess(quest);
  } catch (error) {
    return apiError(error);
  }
});
