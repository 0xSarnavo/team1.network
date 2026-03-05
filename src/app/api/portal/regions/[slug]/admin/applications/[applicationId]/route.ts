import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

export const PATCH = withAuth(
  withRegionLead(async (req, { regionId, params }) => {
    try {
      const { status } = await req.json();
      const result = await portalService.updateApplicationStatus(params.applicationId, regionId, status);
      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
