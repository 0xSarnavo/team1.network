import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// PUT /api/portal/regions/[slug]/admin/guides/[guideId]
export const PUT = withAuth(
  withRegionLead(async (req, { regionId, user, params }) => {
    try {
      const body = await req.json();
      const guide = await portalService.regionAdminUpdateGuide(params.guideId, regionId, body, user.id);
      return apiSuccess(guide);
    } catch (error) {
      return apiError(error);
    }
  })
);

// DELETE /api/portal/regions/[slug]/admin/guides/[guideId]
export const DELETE = withAuth(
  withRegionLead(async (_req, { regionId, user, params }) => {
    try {
      const result = await portalService.regionAdminDeleteGuide(params.guideId, regionId, user.id);
      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
