import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

export const PUT = withAuth(
  withRegionLead(async (req, { regionId, params }) => {
    try {
      const body = await req.json();
      const playbook = await portalService.updateRegionPlaybook(params.playbookId, regionId, body);
      return apiSuccess(playbook);
    } catch (error) {
      return apiError(error);
    }
  })
);

export const DELETE = withAuth(
  withRegionLead(async (_req, { regionId, params }) => {
    try {
      const result = await portalService.deleteRegionPlaybook(params.playbookId, regionId);
      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
