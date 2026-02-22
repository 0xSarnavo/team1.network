import { NextRequest } from 'next/server';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/guides/:slug — Guide detail by slug
export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const guide = await portalService.getGuideBySlug(slug);
    return apiSuccess(guide);
  } catch (error) {
    return apiError(error);
  }
}
