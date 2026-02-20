import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// POST /api/profile/me/rewards/:rewardId/claim
export const POST = withAuth(async (_req, { params, user }) => {
  try {
    const result = await profileService.claimReward(user.id, params.rewardId);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
});
