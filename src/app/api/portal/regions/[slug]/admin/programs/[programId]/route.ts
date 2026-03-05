import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// PUT /api/portal/regions/[slug]/admin/programs/[programId]
export const PUT = withAuth(
  withRegionLead(async (req, { regionId, user, params }) => {
    try {
      const body = await req.json();
      const program = await portalService.regionAdminUpdateProgram(params.programId, regionId, body, user.id);
      return apiSuccess(program);
    } catch (error) {
      return apiError(error);
    }
  })
);

// DELETE /api/portal/regions/[slug]/admin/programs/[programId]
export const DELETE = withAuth(
  withRegionLead(async (_req, { regionId, user, params }) => {
    try {
      const result = await portalService.regionAdminDeleteProgram(params.programId, regionId, user.id);
      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
