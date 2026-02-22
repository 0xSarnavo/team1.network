import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/admin/quests/:questId — Quest detail (admin)
export const GET = withAuth(
  withPermission('portal', 'manage_quests', async (_req, { params, user }) => {
    try {
      const quest = await portalService.adminGetQuest(params.questId);
      return apiSuccess(quest);
    } catch (error) {
      return apiError(error);
    }
  })
);

// PUT /api/portal/admin/quests/:questId — Update quest
export const PUT = withAuth(
  withPermission('portal', 'manage_quests', async (req, { params, user }) => {
    try {
      const body = await req.json();
      const quest = await portalService.adminUpdateQuest(params.questId, body, user.id);
      return apiSuccess(quest);
    } catch (error) {
      return apiError(error);
    }
  })
);
