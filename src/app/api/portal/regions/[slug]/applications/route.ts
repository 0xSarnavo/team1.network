import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiCreated, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';
import { AppError } from '@/lib/helpers/errors';

export const POST = withAuth(async (req, { params, user }) => {
  try {
    const region = await db.region.findUnique({ where: { slug: params.slug }, select: { id: true } });
    if (!region) return apiError(new AppError('NOT_FOUND', 'Region not found'));

    const body = await req.json();
    const application = await portalService.submitApplication(region.id, {
      entityType: body.entityType,
      entityId: body.entityId,
      email: body.email,
      formData: body.formData,
    }, user.id);
    return apiCreated(application);
  } catch (error) {
    return apiError(error);
  }
});
