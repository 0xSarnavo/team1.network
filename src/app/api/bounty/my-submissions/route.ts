import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// ============================================================
// GET /api/bounty/my-submissions
// List user's own bounty submissions — auth required
// ============================================================

export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePaginationParams(searchParams);

    const { submissions, total } = await bountyService.getMySubmissions(user.id, page, limit);
    const pagination = getPaginationMeta(page, limit, total);

    return apiSuccess(submissions, pagination);
  } catch (error) {
    return apiError(error);
  }
});
