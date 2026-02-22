import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';

// DELETE /api/profile/me/skills/[skillId] — Remove a skill
export const DELETE = withAuth(async (_req, { user, params }) => {
  try {
    const { skillId } = params;
    await db.userSkill.deleteMany({
      where: { userId: user.id, skillId },
    });
    return apiSuccess({ message: 'Skill removed' });
  } catch (error) {
    return apiError(error);
  }
});
