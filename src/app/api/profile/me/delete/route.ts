import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// POST /api/profile/me/delete — Request account deletion (30-day grace)
export const POST = withAuth(async (_req, { user }) => {
  try {
    const result = await profileService.requestDeletion(user.id);
    return apiSuccess({
      message: 'Account scheduled for deletion',
      scheduledAt: result.scheduledAt,
    });
  } catch (error) {
    return apiError(error);
  }
});
