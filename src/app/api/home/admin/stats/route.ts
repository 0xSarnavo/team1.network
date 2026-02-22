import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { homeService } from '@/lib/services/home.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';

// GET /api/home/admin/stats — List all stats
export const GET = withAuth(
  withPermission('home', 'edit_stats', async (_req, { user }) => {
    try {
      const stats = await homeService.getStats();
      return apiSuccess(stats);
    } catch (error) {
      return apiError(error);
    }
  })
);

// POST /api/home/admin/stats — Create a new stat
export const POST = withAuth(
  withPermission('home', 'edit_stats', async (req, { user }) => {
    try {
      const body = await req.json();
      const stat = await homeService.createStat(body);
      return apiCreated(stat);
    } catch (error) {
      return apiError(error);
    }
  })
);
