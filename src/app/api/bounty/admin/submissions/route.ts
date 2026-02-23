import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// ============================================================
// GET /api/bounty/admin/submissions
// List bounty submissions for review
// ============================================================

export const GET = withAuth(
  withPermission('bounty', 'approve_submissions', async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit } = parsePaginationParams(searchParams);
      const bountyId = searchParams.get('bountyId') || undefined;
      const regionId = searchParams.get('regionId') || undefined;
      const status = searchParams.get('status') || undefined;

      const { submissions, total } = await bountyService.listSubmissions({ page, limit, bountyId, regionId, status });
      const pagination = getPaginationMeta(page, limit, total);

      return apiSuccess(submissions, pagination);
    } catch (error) {
      return apiError(error);
    }
  })
);
