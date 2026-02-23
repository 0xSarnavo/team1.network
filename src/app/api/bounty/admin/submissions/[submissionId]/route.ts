import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// PUT /api/bounty/admin/submissions/[submissionId]
// Approve or reject a submission
// Body: { action: 'approve' | 'reject', rejectNote?: string }
// ============================================================

export const PUT = withAuth(
  withPermission('bounty', 'approve_submissions', async (req, { params, user }) => {
    try {
      const body = await req.json();
      const { action, rejectNote } = body;

      if (action === 'approve') {
        const result = await bountyService.approveSubmission(params.submissionId, user.id);
        return apiSuccess(result);
      } else if (action === 'reject') {
        const result = await bountyService.rejectSubmission(params.submissionId, rejectNote || '', user.id);
        return apiSuccess(result);
      } else {
        return apiError(new Error('Invalid action. Use "approve" or "reject"'));
      }
    } catch (error) {
      return apiError(error);
    }
  })
);
