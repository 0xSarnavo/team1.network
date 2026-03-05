import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';
import { AppError } from '@/lib/helpers/errors';

export const GET = withAuth(async (req, { params }) => {
  try {
    const region = await db.region.findUnique({ where: { slug: params.slug }, select: { id: true } });
    if (!region) return apiError(new AppError('NOT_FOUND', 'Region not found'));

    const { searchParams } = new URL(req.url);
    const audience = searchParams.get('audience') || undefined;
    const announcements = await portalService.listRegionAnnouncements(region.id, audience);
    return apiSuccess(announcements);
  } catch (error) {
    return apiError(error);
  }
});
