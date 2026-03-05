import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';
import { AppError } from '@/lib/helpers/errors';

export const GET = withAuth(async (_req, { params }) => {
  try {
    const region = await db.region.findUnique({ where: { slug: params.slug }, select: { id: true } });
    if (!region) return apiError(new AppError('NOT_FOUND', 'Region not found'));

    const proposals = await portalService.listRegionProposals(region.id);
    return apiSuccess(proposals);
  } catch (error) {
    return apiError(error);
  }
});

export const POST = withAuth(async (req, { params, user }) => {
  try {
    const region = await db.region.findUnique({ where: { slug: params.slug }, select: { id: true } });
    if (!region) return apiError(new AppError('NOT_FOUND', 'Region not found'));

    const body = await req.json();
    const proposal = await portalService.createRegionProposal(region.id, body, user.id);
    return apiCreated(proposal);
  } catch (error) {
    return apiError(error);
  }
});
