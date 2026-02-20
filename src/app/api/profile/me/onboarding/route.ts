import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// POST /api/profile/me/onboarding — Mark onboarding complete
export const POST = withAuth(async (_req, { user }) => {
  try {
    const result = await profileService.completeOnboarding(user.id);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
});
