import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// POST /api/portal/events/:eventId/rsvp — RSVP to event
export const POST = withAuth(async (_req, { params, user }) => {
  try {
    const result = await portalService.rsvpEvent(params.eventId, user.id);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
});

// DELETE /api/portal/events/:eventId/rsvp — Cancel RSVP
export const DELETE = withAuth(async (_req, { params, user }) => {
  try {
    const result = await portalService.unRsvpEvent(params.eventId, user.id);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
});
