import { NextRequest } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/events/:eventId — Event detail
export const GET = withOptionalAuth(async (_req, { params, user }) => {
  try {
    const event = await portalService.getEventById(params.eventId, user?.id);
    return apiSuccess(event);
  } catch (error) {
    return apiError(error);
  }
});
