import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// GET /api/portal/members — Member directory (paginated, filterable)
export const GET = withAuth(async (req, { user }) => {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const regionId = searchParams.get('regionId') || undefined;
    const skill = searchParams.get('skill') || undefined;
    const availability = searchParams.get('availability') || undefined;
    const search = searchParams.get('search') || undefined;

    const { members, total } = await portalService.searchMembers({
      page, limit, regionId, skill, availability, search,
    });

    const pagination = getPaginationMeta(page, limit, total);
    return apiSuccess(members, pagination);
  } catch (error) {
    return apiError(error);
  }
});
