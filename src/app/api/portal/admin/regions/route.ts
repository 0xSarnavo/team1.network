import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/admin/regions — List all regions
export const GET = withAuth(
  withPermission('portal', 'manage_members', async (_req, { user }) => {
    try {
      const regions = await portalService.adminListRegions();
      return apiSuccess(regions);
    } catch (error) {
      return apiError(error);
    }
  })
);

// POST /api/portal/admin/regions — Create region
export const POST = withAuth(
  withPermission('portal', 'manage_members', async (req, { user }) => {
    try {
      const body = await req.json();
      const region = await portalService.adminCreateRegion(body, user.id);
      return apiCreated(region);
    } catch (error) {
      return apiError(error);
    }
  })
);
