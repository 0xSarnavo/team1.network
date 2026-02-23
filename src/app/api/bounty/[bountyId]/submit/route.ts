import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiCreated, apiError } from '@/lib/helpers/api-response';

// ============================================================
// POST /api/bounty/[bountyId]/submit
// Submit proof for a bounty — auth required
// ============================================================

export const POST = withAuth(async (req, { params, user }) => {
  try {
    const body = await req.json();
    const result = await bountyService.submitProof(params.bountyId, user.id, body);
    return apiCreated(result);
  } catch (error) {
    return apiError(error);
  }
});
