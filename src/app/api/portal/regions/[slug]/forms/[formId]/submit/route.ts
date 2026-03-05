import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiCreated, apiError } from '@/lib/helpers/api-response';

// POST /api/portal/regions/[slug]/forms/[formId]/submit
export const POST = withAuth(
  async (req, { user, params }) => {
    try {
      const body = await req.json();
      const result = await portalService.submitForm(params.formId, user.id, body);
      return apiCreated(result);
    } catch (error) {
      return apiError(error);
    }
  }
);
