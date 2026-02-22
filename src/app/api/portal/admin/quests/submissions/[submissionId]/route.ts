import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// PUT /api/portal/admin/quests/submissions/:submissionId — Approve or reject submission
export const PUT = withAuth(
  withPermission('portal', 'manage_quests', async (req, { params, user }) => {
    try {
      const body = await req.json();
      const { action, rejectNote } = body;

      let result;
      if (action === 'approve') {
        result = await portalService.adminApproveSubmission(params.submissionId, user.id);
      } else if (action === 'reject') {
        result = await portalService.adminRejectSubmission(
          params.submissionId,
          rejectNote || '',
          user.id
        );
      } else {
        return apiError(new Error('Invalid action. Use: approve, reject'));
      }

      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
