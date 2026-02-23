import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// GET /api/leaderboard/region/[regionId]
// Region-specific leaderboard — auth required
// ============================================================

export const GET = withAuth(async (req, { params, user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const leaderboard = await bountyService.getRegionLeaderboard(params.regionId, limit);
    return apiSuccess(leaderboard);
  } catch (error) {
    return apiError(error);
  }
});
