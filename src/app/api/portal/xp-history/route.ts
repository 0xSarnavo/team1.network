import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { xpService } from '@/lib/services/xp.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// GET /api/portal/xp-history — User's XP transaction history
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePaginationParams(searchParams);

    const { transactions, total } = await xpService.getHistory(user.id, page, limit);
    const pagination = getPaginationMeta(page, limit, total);

    return apiSuccess(transactions, pagination);
  } catch (error) {
    return apiError(error);
  }
});
