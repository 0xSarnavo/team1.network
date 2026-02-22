import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';

// DELETE /api/profile/me/roles/[roleId] — Remove a profile role
export const DELETE = withAuth(async (_req, { user, params }) => {
  try {
    const { roleId } = params;
    await db.userProfileRole.deleteMany({
      where: { id: roleId, userId: user.id },
    });
    return apiSuccess({ message: 'Role removed' });
  } catch (error) {
    return apiError(error);
  }
});
