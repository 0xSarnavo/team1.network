import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// ============================================================
// GET /api/bounty/admin
// List bounties for admin management
// ============================================================

export const GET = withAuth(
  withPermission('bounty', 'create_bounties', async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit } = parsePaginationParams(searchParams);
      const regionId = searchParams.get('regionId') || undefined;
      const status = searchParams.get('status') || undefined;
      const category = searchParams.get('category') || undefined;

      const { bounties, total } = await bountyService.adminListBounties({ page, limit, regionId, status, category });
      const pagination = getPaginationMeta(page, limit, total);

      return apiSuccess(bounties, pagination);
    } catch (error) {
      return apiError(error);
    }
  })
);

// ============================================================
// POST /api/bounty/admin
// Create a new bounty
// ============================================================

export const POST = withAuth(
  withPermission('bounty', 'create_bounties', async (req, { user }) => {
    try {
      const body = await req.json();
      const bounty = await bountyService.createBounty(body, user.id);
      return apiCreated(bounty);
    } catch (error) {
      return apiError(error);
    }
  })
);
