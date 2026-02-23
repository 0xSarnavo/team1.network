import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// PUT /api/bounty/admin/[bountyId]
// Update a bounty
// ============================================================

export const PUT = withAuth(
  withPermission('bounty', 'edit_bounties', async (req, { params, user }) => {
    try {
      const body = await req.json();
      const bounty = await bountyService.updateBounty(params.bountyId, body, user.id);
      return apiSuccess(bounty);
    } catch (error) {
      return apiError(error);
    }
  })
);

// ============================================================
// DELETE /api/bounty/admin/[bountyId]
// Archive a bounty
// ============================================================

export const DELETE = withAuth(
  withPermission('bounty', 'edit_bounties', async (req, { params, user }) => {
    try {
      const result = await bountyService.deleteBounty(params.bountyId, user.id);
      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
