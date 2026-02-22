import { NextRequest } from 'next/server';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// GET /api/portal/guides — List published guides (paginated, filterable)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;

    const { guides, total } = await portalService.listGuides({
      page, limit, category, search,
    });

    const pagination = getPaginationMeta(page, limit, total);
    return apiSuccess(guides, pagination);
  } catch (error) {
    return apiError(error);
  }
}
