import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { homeService } from '@/lib/services/home.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// GET /api/home/admin/footer
// Get footer section (admin)
// ============================================================

export const GET = withAuth(
  withPermission('home', 'edit_footer', async (_req, { user }) => {
    try {
      const footer = await homeService.getFooter();
      return apiSuccess(footer);
    } catch (error) {
      return apiError(error);
    }
  })
);

// ============================================================
// PUT /api/home/admin/footer
// Update footer section
// ============================================================

export const PUT = withAuth(
  withPermission('home', 'edit_footer', async (req, { user }) => {
    try {
      const body = await req.json();
      const footer = await homeService.updateFooter(body);
      return apiSuccess({ message: 'Footer section updated', footer });
    } catch (error) {
      return apiError(error);
    }
  })
);
