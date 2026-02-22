import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// GET /api/portal/admin/quests — List quests (admin view)
export const GET = withAuth(
  withPermission('portal', 'manage_quests', async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit } = parsePaginationParams(searchParams);
      const category = searchParams.get('category') || undefined;
      const isActive = searchParams.get('isActive');

      const { quests, total } = await portalService.adminListQuests({
        page,
        limit,
        category,
        isActive: isActive !== null ? isActive === 'true' : undefined,
      });

      const pagination = getPaginationMeta(page, limit, total);
      return apiSuccess(quests, pagination);
    } catch (error) {
      return apiError(error);
    }
  })
);

// POST /api/portal/admin/quests — Create quest
export const POST = withAuth(
  withPermission('portal', 'manage_quests', async (req, { user }) => {
    try {
      const body = await req.json();
      const quest = await portalService.adminCreateQuest(body, user.id);
      return apiCreated(quest);
    } catch (error) {
      return apiError(error);
    }
  })
);
