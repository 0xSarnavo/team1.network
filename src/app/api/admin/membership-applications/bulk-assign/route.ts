import { withAuth } from '@/lib/middleware/auth.middleware';
import { withAdminAccess } from '@/lib/middleware/permissions.middleware';
import { membershipApplicationService } from '@/lib/services/membership-application.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// POST /api/admin/membership-applications/bulk-assign — Bulk assign by country
export const POST = withAuth(
  withAdminAccess(async (req, { user }) => {
    try {
      const body = await req.json();
      const { country, regionId } = body;

      if (!country || !regionId) {
        return apiError(new Error('country and regionId are required'));
      }

      const result = await membershipApplicationService.bulkAssignByCountry(country, regionId, user.id);
      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
