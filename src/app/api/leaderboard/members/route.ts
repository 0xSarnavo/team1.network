import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// GET /api/leaderboard/members
// Member leaderboard — top members by XP, auth required
// ============================================================

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const leaderboard = await bountyService.getMemberLeaderboard(limit);
    return apiSuccess(leaderboard);
  } catch (error) {
    return apiError(error);
  }
});
