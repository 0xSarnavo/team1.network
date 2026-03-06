import { withAuth } from '@/lib/middleware/auth.middleware';
import { withAdminAccess } from '@/lib/middleware/permissions.middleware';
import { membershipApplicationService } from '@/lib/services/membership-application.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/admin/membership-applications — List all applications with filters
export const GET = withAuth(
  withAdminAccess(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const result = await membershipApplicationService.listApplications({
        page: Number(searchParams.get('page')) || 1,
        limit: Number(searchParams.get('limit')) || 20,
        status: searchParams.get('status') || undefined,
        country: searchParams.get('country') || undefined,
        search: searchParams.get('search') || undefined,
      });
      return apiSuccess(result.applications, result.pagination);
    } catch (error) {
      return apiError(error);
    }
  })
);
