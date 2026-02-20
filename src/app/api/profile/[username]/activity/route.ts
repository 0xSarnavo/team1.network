import { NextRequest } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// GET /api/profile/:username/activity — User activity timeline
export const GET = withOptionalAuth(async (req, { params, user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const filter = searchParams.get('filter') || 'all';

    const { activities, total } = await profileService.getActivity(
      params.username, user?.id, page, limit, filter
    );

    return apiSuccess(activities, getPaginationMeta(page, limit, total));
  } catch (error) {
    return apiError(error);
  }
});
