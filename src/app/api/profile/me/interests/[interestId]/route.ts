import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';

// DELETE /api/profile/me/interests/[interestId] — Remove an interest
export const DELETE = withAuth(async (_req, { user, params }) => {
  try {
    const { interestId } = params;
    await db.userInterest.deleteMany({
      where: { userId: user.id, interestId },
    });
    return apiSuccess({ message: 'Interest removed' });
  } catch (error) {
    return apiError(error);
  }
});
