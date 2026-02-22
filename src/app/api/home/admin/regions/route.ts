import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { homeService } from '@/lib/services/home.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/home/admin/regions — Get region cards
export const GET = withAuth(
  withPermission('home', 'edit_regions', async (_req, { user }) => {
    try {
      const regionCards = await homeService.getRegionCards();
      return apiSuccess(regionCards);
    } catch (error) {
      return apiError(error);
    }
  })
);

// PUT /api/home/admin/regions — Upsert a region card
export const PUT = withAuth(
  withPermission('home', 'edit_regions', async (req, { user }) => {
    try {
      const body = await req.json();
      const regionCard = await homeService.upsertRegionCard(body);
      return apiSuccess({ message: 'Region card updated', regionCard });
    } catch (error) {
      return apiError(error);
    }
  })
);
