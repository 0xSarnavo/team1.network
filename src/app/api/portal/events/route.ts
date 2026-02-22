import { NextRequest } from 'next/server';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// GET /api/portal/events — List events (paginated, filterable)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const regionId = searchParams.get('regionId') || undefined;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;

    const { events, total } = await portalService.listEvents({
      page, limit, regionId, type, status,
    });

    const pagination = getPaginationMeta(page, limit, total);
    return apiSuccess(events, pagination);
  } catch (error) {
    return apiError(error);
  }
}
