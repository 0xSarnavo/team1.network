import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiCreated, apiError } from '@/lib/helpers/api-response';

// POST /api/portal/events/host-application — Submit host application
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const result = await portalService.createHostApplication(user.id, body);
    return apiCreated(result);
  } catch (error) {
    return apiError(error);
  }
});
