import { NextRequest } from 'next/server';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// ============================================================
// GET /api/bounty
// List global (public) bounties — no auth required
// ============================================================

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const { bounties, total } = await bountyService.listPublicBounties({ page, limit, category, search });
    const pagination = getPaginationMeta(page, limit, total);

    return apiSuccess(bounties, pagination);
  } catch (error) {
    return apiError(error);
  }
}
