import { withAuth } from '@/lib/middleware/auth.middleware';
import { withAdminAccess } from '@/lib/middleware/permissions.middleware';
import { membershipApplicationService } from '@/lib/services/membership-application.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/admin/membership-applications/countries — Distinct countries for filter
export const GET = withAuth(
  withAdminAccess(async () => {
    try {
      const countries = await membershipApplicationService.getDistinctCountries();
      return apiSuccess(countries);
    } catch (error) {
      return apiError(error);
    }
  })
);
