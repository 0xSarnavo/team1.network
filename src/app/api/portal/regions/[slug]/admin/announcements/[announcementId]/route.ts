import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

export const DELETE = withAuth(
  withRegionLead(async (_req, { regionId, params }) => {
    try {
      const result = await portalService.deleteRegionAnnouncement(params.announcementId, regionId);
      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
