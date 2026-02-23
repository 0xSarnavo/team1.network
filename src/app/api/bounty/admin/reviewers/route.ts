import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';

// ============================================================
// GET /api/bounty/admin/reviewers?regionId=xxx
// List bounty reviewers for a region
// ============================================================

export const GET = withAuth(
  withPermission('bounty', 'create_bounties', async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const regionId = searchParams.get('regionId');
      if (!regionId) return apiError(new Error('Missing regionId parameter'));

      const reviewers = await bountyService.listReviewers(regionId);
      return apiSuccess(reviewers);
    } catch (error) {
      return apiError(error);
    }
  })
);

// ============================================================
// POST /api/bounty/admin/reviewers
// Add a bounty reviewer
// Body: { regionId, email, canCreate }
// ============================================================

export const POST = withAuth(
  withPermission('bounty', 'create_bounties', async (req, { user }) => {
    try {
      const body = await req.json();
      const { regionId, email, canCreate } = body;

      if (!regionId || !email) return apiError(new Error('Missing regionId or email'));

      // Find user by email
      const targetUser = await db.user.findUnique({ where: { email } });
      if (!targetUser) return apiError(new Error('User not found with that email'));

      const reviewer = await bountyService.addReviewer(regionId, targetUser.id, !!canCreate, user.id);
      return apiCreated(reviewer);
    } catch (error) {
      return apiError(error);
    }
  })
);

// ============================================================
// DELETE /api/bounty/admin/reviewers?id=xxx
// Remove a bounty reviewer
// ============================================================

export const DELETE = withAuth(
  withPermission('bounty', 'create_bounties', async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
      if (!id) return apiError(new Error('Missing id parameter'));

      const result = await bountyService.removeReviewer(id, user.id);
      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
