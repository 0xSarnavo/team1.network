import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/admin/analytics — Portal analytics stats
export const GET = withAuth(
  withPermission('portal', 'view_analytics', async (_req, { user }) => {
    try {
      const stats = await portalService.getAdminStats();
      return apiSuccess(stats);
    } catch (error) {
      return apiError(error);
    }
  })
);
