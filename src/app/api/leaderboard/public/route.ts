import { NextRequest } from 'next/server';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// GET /api/leaderboard/public
// Public leaderboard — top users by XP, no auth required
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);

    const leaderboard = await bountyService.getPublicLeaderboard(limit);
    return apiSuccess(leaderboard);
  } catch (error) {
    return apiError(error);
  }
}
