import { NextRequest } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// GET /api/bounty/[bountyId]
// Get bounty detail — optional auth (shows user's submissions if logged in)
// ============================================================

export const GET = withOptionalAuth(async (req, { params, user }) => {
  try {
    const bounty = await bountyService.getBountyById(params.bountyId, user?.id);
    return apiSuccess(bounty);
  } catch (error) {
    return apiError(error);
  }
});
