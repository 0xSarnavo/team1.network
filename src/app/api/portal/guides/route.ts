import { NextRequest } from 'next/server';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';
import db from '@/lib/db/client';

// GET /api/portal/guides — List published guides (paginated, filterable)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const regionSlug = searchParams.get('region') || undefined;
    const visibility = (searchParams.get('visibility') as 'public' | 'member') || undefined;

    let regionId: string | undefined;
    if (regionSlug) {
      const region = await db.region.findUnique({ where: { slug: regionSlug }, select: { id: true } });
      if (region) regionId = region.id;
    }

    const { guides, total } = await portalService.listGuides({
      page, limit, category, search, regionId, visibility,
    });

    const pagination = getPaginationMeta(page, limit, total);
    return apiSuccess(guides, pagination);
  } catch (error) {
    return apiError(error);
  }
}
