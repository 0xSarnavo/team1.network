import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withAdminAccess } from '@/lib/middleware/permissions.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// PUT /api/admin/bounties/[bountyId] — Update any bounty
export const PUT = withAuth(
  withAdminAccess(async (req, { user, params }) => {
    try {
      const { bountyId } = await params;
      const body = await req.json();
      const bounty = await bountyService.updateBounty(bountyId as string, body, user.id);
      return apiSuccess(bounty);
    } catch (error) {
      return apiError(error);
    }
  })
);

// DELETE /api/admin/bounties/[bountyId] — Archive any bounty
export const DELETE = withAuth(
  withAdminAccess(async (req, { user, params }) => {
    try {
      const { bountyId } = await params;
      await bountyService.deleteBounty(bountyId as string, user.id);
      return apiSuccess({ archived: true });
    } catch (error) {
      return apiError(error);
    }
  })
);
