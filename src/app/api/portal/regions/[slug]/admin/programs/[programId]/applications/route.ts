import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

export const GET = withAuth(
  withRegionLead(async (_req, { regionId, params }) => {
    try {
      const applications = await portalService.listApplications(regionId, 'program', params.programId);
      return apiSuccess(applications);
    } catch (error) {
      return apiError(error);
    }
  })
);
