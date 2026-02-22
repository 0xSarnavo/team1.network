import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/admin/guides/:guideId — Guide detail (admin)
export const GET = withAuth(
  withPermission('portal', 'manage_guides', async (_req, { params, user }) => {
    try {
      const guide = await portalService.adminGetGuide(params.guideId);
      return apiSuccess(guide);
    } catch (error) {
      return apiError(error);
    }
  })
);

// PUT /api/portal/admin/guides/:guideId — Update guide
export const PUT = withAuth(
  withPermission('portal', 'manage_guides', async (req, { params, user }) => {
    try {
      const body = await req.json();
      const guide = await portalService.adminUpdateGuide(params.guideId, body, user.id);
      return apiSuccess(guide);
    } catch (error) {
      return apiError(error);
    }
  })
);

// DELETE /api/portal/admin/guides/:guideId — Delete guide
export const DELETE = withAuth(
  withPermission('portal', 'manage_guides', async (_req, { params, user }) => {
    try {
      const result = await portalService.adminDeleteGuide(params.guideId, user.id);
      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
