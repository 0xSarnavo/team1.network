import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';

const skillsSchema = z.object({
  skills: z.array(z.string().min(1).max(100)).max(20),
});

// PUT /api/profile/me/skills — Update user skills
export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { skills } = skillsSchema.parse(body);
    await profileService.updateSkills(user.id, skills);
    return apiSuccess({ message: 'Skills updated' });
  } catch (error) {
    return apiError(error);
  }
});
