import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/admin/events/:eventId — Event detail (admin)
export const GET = withAuth(
  withPermission('portal', 'manage_events', async (_req, { params, user }) => {
    try {
      const event = await portalService.adminGetEvent(params.eventId);
      return apiSuccess(event);
    } catch (error) {
      return apiError(error);
    }
  })
);

// PUT /api/portal/admin/events/:eventId — Update event
export const PUT = withAuth(
  withPermission('portal', 'manage_events', async (req, { params, user }) => {
    try {
      const body = await req.json();
      const event = await portalService.adminUpdateEvent(params.eventId, body, user.id);
      return apiSuccess(event);
    } catch (error) {
      return apiError(error);
    }
  })
);

// DELETE /api/portal/admin/events/:eventId — Delete event
export const DELETE = withAuth(
  withPermission('portal', 'manage_events', async (_req, { params, user }) => {
    try {
      const result = await portalService.adminDeleteEvent(params.eventId, user.id);
      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
