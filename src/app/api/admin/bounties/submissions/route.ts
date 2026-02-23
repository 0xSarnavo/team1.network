import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withAdminAccess } from '@/lib/middleware/permissions.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// GET /api/admin/bounties/submissions — List all submissions platform-wide
export const GET = withAuth(
  withAdminAccess(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit } = parsePaginationParams(searchParams);
      const status = searchParams.get('status') || undefined;
      const bountyId = searchParams.get('bountyId') || undefined;

      const { submissions, total } = await bountyService.listSubmissions({
        page, limit, status, bountyId,
      });
      const pagination = getPaginationMeta(page, limit, total);

      return apiSuccess(submissions, pagination);
    } catch (error) {
      return apiError(error);
    }
  })
);
