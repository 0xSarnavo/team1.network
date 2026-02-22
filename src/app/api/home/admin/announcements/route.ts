import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { homeService } from '@/lib/services/home.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// ============================================================
// GET /api/home/admin/announcements
// List all announcements (admin, paginated)
// ============================================================

export const GET = withAuth(
  withPermission('home', 'edit_announcements', async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit } = parsePaginationParams(searchParams);

      const { announcements, total } = await homeService.listAnnouncements(page, limit);
      const pagination = getPaginationMeta(page, limit, total);

      return apiSuccess(announcements, pagination);
    } catch (error) {
      return apiError(error);
    }
  })
);

// ============================================================
// POST /api/home/admin/announcements
// Create a new announcement
// ============================================================

export const POST = withAuth(
  withPermission('home', 'edit_announcements', async (req, { user }) => {
    try {
      const body = await req.json();
      const announcement = await homeService.createAnnouncement(body);
      return apiCreated(announcement);
    } catch (error) {
      return apiError(error);
    }
  })
);

// ============================================================
// PUT /api/home/admin/announcements?id=xxx
// Update an announcement
// ============================================================

export const PUT = withAuth(
  withPermission('home', 'edit_announcements', async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      if (!id) return apiError(new Error('Missing id parameter'));

      const body = await req.json();
      const announcement = await homeService.updateAnnouncement(id, body);
      return apiSuccess(announcement);
    } catch (error) {
      return apiError(error);
    }
  })
);

// ============================================================
// DELETE /api/home/admin/announcements?id=xxx
// Delete an announcement
// ============================================================

export const DELETE = withAuth(
  withPermission('home', 'edit_announcements', async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      if (!id) return apiError(new Error('Missing id parameter'));

      await homeService.deleteAnnouncement(id);
      return apiSuccess({ deleted: true });
    } catch (error) {
      return apiError(error);
    }
  })
);
