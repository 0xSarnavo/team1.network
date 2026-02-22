import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/dashboard — Member dashboard data
export const GET = withAuth(async (_req, { user }) => {
  try {
    const data = await portalService.getMemberDashboard(user.id);
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
});
