import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { homeService } from '@/lib/services/home.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// GET /api/home/admin/about
// Get about section (admin)
// ============================================================

export const GET = withAuth(
  withPermission('home', 'edit_about', async (_req, { user }) => {
    try {
      const about = await homeService.getAbout();
      return apiSuccess(about);
    } catch (error) {
      return apiError(error);
    }
  })
);

// ============================================================
// PUT /api/home/admin/about
// Update about section
// ============================================================

export const PUT = withAuth(
  withPermission('home', 'edit_about', async (req, { user }) => {
    try {
      const body = await req.json();
      const about = await homeService.updateAbout(body);
      return apiSuccess({ message: 'About section updated', about });
    } catch (error) {
      return apiError(error);
    }
  })
);
