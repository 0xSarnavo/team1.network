import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withAdminAccess } from '@/lib/middleware/permissions.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// PUT /api/admin/bounties/submissions/[submissionId] — Approve or reject any submission
export const PUT = withAuth(
  withAdminAccess(async (req, { user, params }) => {
    try {
      const { submissionId } = await params;
      const body = await req.json();

      if (body.action === 'approve') {
        const result = await bountyService.approveSubmission(submissionId as string, user.id);
        return apiSuccess(result);
      } else if (body.action === 'reject') {
        const result = await bountyService.rejectSubmission(
          submissionId as string,
          body.rejectNote || 'Rejected by admin',
          user.id,
        );
        return apiSuccess(result);
      }

      return apiError(new Error('Invalid action. Use "approve" or "reject".'));
    } catch (error) {
      return apiError(error);
    }
  })
);
