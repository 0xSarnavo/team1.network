import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withAdminAccess } from '@/lib/middleware/permissions.middleware';
import { bountyService } from '@/lib/services/bounty.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// GET /api/admin/bounties — List all bounties (global + regional) for super admin
export const GET = withAuth(
  withAdminAccess(async (req) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit } = parsePaginationParams(searchParams);
      const regionId = searchParams.get('regionId') || undefined;
      const status = searchParams.get('status') || undefined;
      const category = searchParams.get('category') || undefined;

      const { bounties, total } = await bountyService.adminListBounties({
        page, limit, regionId, status, category,
      });
      const pagination = getPaginationMeta(page, limit, total);

      return apiSuccess(bounties, pagination);
    } catch (error) {
      return apiError(error);
    }
  })
);

// POST /api/admin/bounties — Create a global bounty (regionId = null)
export const POST = withAuth(
  withAdminAccess(async (req, { user }) => {
    try {
      const body = await req.json();
      // Super admin creates global bounties by default (no regionId)
      const bounty = await bountyService.createBounty({
        title: body.title,
        description: body.description,
        category: body.category || 'content',
        xpReward: body.xpReward || 50,
        type: body.type || 'one_time',
        regionId: body.regionId || null,
        maxSubmissions: body.maxSubmissions || null,
        startsAt: body.startsAt || null,
        endsAt: body.endsAt || null,
        proofRequirements: body.proofRequirements || null,
        status: body.status || 'draft',
      }, user.id);

      return apiCreated(bounty);
    } catch (error) {
      return apiError(error);
    }
  })
);
