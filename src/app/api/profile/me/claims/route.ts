import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/profile/me/claims — All claimable items
export const GET = withAuth(async (_req, { user }) => {
  try {
    const claims = await profileService.getClaimables(user.id);
    return apiSuccess(claims);
  } catch (error) {
    return apiError(error);
  }
});
