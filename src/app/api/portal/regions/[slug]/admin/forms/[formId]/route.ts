import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// PUT /api/portal/regions/[slug]/admin/forms/[formId]
export const PUT = withAuth(
  withRegionLead(async (req, { regionId, user, params }) => {
    try {
      const body = await req.json();
      const form = await portalService.regionAdminUpdateForm(params.formId, regionId, body, user.id);
      return apiSuccess(form);
    } catch (error) {
      return apiError(error);
    }
  })
);

// DELETE /api/portal/regions/[slug]/admin/forms/[formId]
export const DELETE = withAuth(
  withRegionLead(async (_req, { regionId, user, params }) => {
    try {
      const result = await portalService.regionAdminDeleteForm(params.formId, regionId, user.id);
      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
