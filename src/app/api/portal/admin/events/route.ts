import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// GET /api/portal/admin/events — List events (admin view)
export const GET = withAuth(
  withPermission('portal', 'manage_events', async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit } = parsePaginationParams(searchParams);
      const status = searchParams.get('status') || undefined;
      const regionId = searchParams.get('regionId') || undefined;

      const { events, total } = await portalService.adminListEvents({
        page, limit, status, regionId,
      });

      const pagination = getPaginationMeta(page, limit, total);
      return apiSuccess(events, pagination);
    } catch (error) {
      return apiError(error);
    }
  })
);

// POST /api/portal/admin/events — Create event
export const POST = withAuth(
  withPermission('portal', 'manage_events', async (req, { user }) => {
    try {
      const body = await req.json();
      const event = await portalService.adminCreateEvent(body, user.id);
      return apiCreated(event);
    } catch (error) {
      return apiError(error);
    }
  })
);
