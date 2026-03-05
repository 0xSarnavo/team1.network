import { NextRequest } from 'next/server';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';

// GET /api/portal/programs — List active programs
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const regionSlug = searchParams.get('region') || undefined;
    const visibility = (searchParams.get('visibility') as 'public' | 'member') || undefined;

    let regionId: string | undefined;
    if (regionSlug) {
      const region = await db.region.findUnique({ where: { slug: regionSlug }, select: { id: true } });
      if (region) regionId = region.id;
    }

    const programs = await portalService.listPrograms({ regionId, visibility });
    return apiSuccess(programs);
  } catch (error) {
    return apiError(error);
  }
}
