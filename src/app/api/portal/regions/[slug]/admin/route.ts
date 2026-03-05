import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/regions/[slug]/admin — Region admin overview stats
export const GET = withAuth(
  withRegionLead(async (_req, { regionId }) => {
    try {
      const stats = await portalService.regionAdminOverview(regionId);
      return apiSuccess(stats);
    } catch (error) {
      return apiError(error);
    }
  })
);
