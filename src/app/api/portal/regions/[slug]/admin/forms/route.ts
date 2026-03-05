import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/regions/[slug]/admin/forms
export const GET = withAuth(
  withRegionLead(async (_req, { regionId }) => {
    try {
      const forms = await portalService.regionAdminListForms(regionId);
      return apiSuccess(forms);
    } catch (error) {
      return apiError(error);
    }
  })
);

// POST /api/portal/regions/[slug]/admin/forms
export const POST = withAuth(
  withRegionLead(async (req, { regionId, user }) => {
    try {
      const body = await req.json();
      const form = await portalService.regionAdminCreateForm(regionId, body, user.id);
      return apiCreated(form);
    } catch (error) {
      return apiError(error);
    }
  })
);
