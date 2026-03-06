import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { membershipApplicationService } from '@/lib/services/membership-application.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/regions/[slug]/admin/membership-applications — List region applications
export const GET = withAuth(
  withRegionLead(async (req, { regionId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status') || undefined;
      const applications = await membershipApplicationService.listRegionApplications(regionId, status);
      return apiSuccess(applications);
    } catch (error) {
      return apiError(error);
    }
  })
);
