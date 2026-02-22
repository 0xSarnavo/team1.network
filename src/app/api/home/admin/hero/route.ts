import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { homeService } from '@/lib/services/home.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// GET /api/home/admin/hero
// Get hero section (admin)
// ============================================================

export const GET = withAuth(
  withPermission('home', 'edit_hero', async (_req, { user }) => {
    try {
      const hero = await homeService.getHero();
      return apiSuccess(hero);
    } catch (error) {
      return apiError(error);
    }
  })
);

// ============================================================
// PUT /api/home/admin/hero
// Update hero section
// ============================================================

export const PUT = withAuth(
  withPermission('home', 'edit_hero', async (req, { user }) => {
    try {
      const body = await req.json();
      const hero = await homeService.updateHero(body);
      return apiSuccess({ message: 'Hero section updated', hero });
    } catch (error) {
      return apiError(error);
    }
  })
);
