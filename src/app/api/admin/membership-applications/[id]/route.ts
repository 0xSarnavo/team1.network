import { withAuth } from '@/lib/middleware/auth.middleware';
import { withAdminAccess } from '@/lib/middleware/permissions.middleware';
import { membershipApplicationService } from '@/lib/services/membership-application.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/admin/membership-applications/[id] — Get application detail
export const GET = withAuth(
  withAdminAccess(async (_req, { params }) => {
    try {
      const { id } = await params;
      const application = await membershipApplicationService.getApplicationById(id);
      return apiSuccess(application);
    } catch (error) {
      return apiError(error);
    }
  })
);

// PATCH /api/admin/membership-applications/[id] — Assign, approve, or reject
export const PATCH = withAuth(
  withAdminAccess(async (req, { user, params }) => {
    try {
      const { id } = await params;
      const body = await req.json();

      if (body.action === 'assign') {
        const result = await membershipApplicationService.assignToRegion(id, body.regionId, user.id);
        return apiSuccess(result);
      }

      if (body.action === 'approve' || body.action === 'reject') {
        const result = await membershipApplicationService.finalDecision(id, body.action, user.id, body.note);
        return apiSuccess(result);
      }

      return apiError(new Error('Invalid action. Use "assign", "approve", or "reject".'));
    } catch (error) {
      return apiError(error);
    }
  })
);
