import { NextRequest } from 'next/server';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/regions/[slug] — Get region details
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const region = await portalService.getRegionBySlug(slug);
    return apiSuccess(region);
  } catch (error) {
    return apiError(error);
  }
}
