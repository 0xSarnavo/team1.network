import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// GET /api/portal/admin/members — List members (paginated, filterable)
export const GET = withAuth(
  withPermission('portal', 'manage_members', async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit } = parsePaginationParams(searchParams);
      const regionId = searchParams.get('regionId') || undefined;
      const status = searchParams.get('status') || undefined;
      const search = searchParams.get('search') || undefined;

      const { memberships, total } = await portalService.adminListMembers({
        page, limit, regionId, status, search,
      });

      const pagination = getPaginationMeta(page, limit, total);
      return apiSuccess(memberships, pagination);
    } catch (error) {
      return apiError(error);
    }
  })
);
