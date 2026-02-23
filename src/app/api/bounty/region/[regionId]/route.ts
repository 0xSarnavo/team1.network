import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// ============================================================
// GET /api/bounty/region/[regionId]
// List regional bounties — auth + member required
// ============================================================

export const GET = withAuth(async (req, { params, user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const category = searchParams.get('category') || undefined;

    const { bounties, total } = await bountyService.listRegionBounties(
      params.regionId,
      user.id,
      { page, limit, category }
    );
    const pagination = getPaginationMeta(page, limit, total);

    return apiSuccess(bounties, pagination);
  } catch (error) {
    return apiError(error);
  }
});
