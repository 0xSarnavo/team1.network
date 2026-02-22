import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// GET /api/portal/admin/guides — List guides (admin view)
export const GET = withAuth(
  withPermission('portal', 'manage_guides', async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit } = parsePaginationParams(searchParams);
      const status = searchParams.get('status') || undefined;
      const category = searchParams.get('category') || undefined;

      const { guides, total } = await portalService.adminListGuides({
        page, limit, status, category,
      });

      const pagination = getPaginationMeta(page, limit, total);
      return apiSuccess(guides, pagination);
    } catch (error) {
      return apiError(error);
    }
  })
);

// POST /api/portal/admin/guides — Create guide
export const POST = withAuth(
  withPermission('portal', 'manage_guides', async (req, { user }) => {
    try {
      const body = await req.json();
      const guide = await portalService.adminCreateGuide(body, user.id);
      return apiCreated(guide);
    } catch (error) {
      return apiError(error);
    }
  })
);
