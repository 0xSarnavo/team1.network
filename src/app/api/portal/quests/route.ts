import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/quests — List quests (by category)
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;

    const quests = await portalService.listQuests({ category });
    return apiSuccess(quests);
  } catch (error) {
    return apiError(error);
  }
});
