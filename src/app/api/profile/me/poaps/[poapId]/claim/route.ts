import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// POST /api/profile/me/poaps/:poapId/claim
export const POST = withAuth(async (_req, { params, user }) => {
  try {
    const result = await profileService.claimPoap(user.id, params.poapId);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
});
