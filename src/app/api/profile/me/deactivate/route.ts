import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// POST /api/profile/me/deactivate
export const POST = withAuth(async (_req, { user }) => {
  try {
    await profileService.deactivateAccount(user.id);
    return apiSuccess({ message: 'Account deactivated' });
  } catch (error) {
    return apiError(error);
  }
});
