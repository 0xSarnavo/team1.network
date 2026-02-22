import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';

// DELETE /api/profile/me/socials/[socialId] — Remove a social link
export const DELETE = withAuth(async (_req, { user, params }) => {
  try {
    const { socialId } = params;
    await db.userSocialLink.deleteMany({
      where: { id: socialId, userId: user.id },
    });
    return apiSuccess({ message: 'Social link removed' });
  } catch (error) {
    return apiError(error);
  }
});
