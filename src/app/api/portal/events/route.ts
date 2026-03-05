import { NextRequest } from 'next/server';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';
import db from '@/lib/db/client';

// GET /api/portal/events — List events (paginated, filterable)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePaginationParams(searchParams);
    let regionId = searchParams.get('regionId') || undefined;
    const regionSlug = searchParams.get('region') || undefined;
    const type = searchParams.get('type') || undefined;
    const status = searchParams.get('status') || undefined;
    const visibility = (searchParams.get('visibility') as 'public' | 'member') || undefined;

    if (!regionId && regionSlug) {
      const region = await db.region.findUnique({ where: { slug: regionSlug }, select: { id: true } });
      if (region) regionId = region.id;
    }

    const { events, total } = await portalService.listEvents({
      page, limit, regionId, type, status, visibility,
    });

    const pagination = getPaginationMeta(page, limit, total);
    return apiSuccess(events, pagination);
  } catch (error) {
    return apiError(error);
  }
}
