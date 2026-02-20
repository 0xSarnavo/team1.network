import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';

const interestsSchema = z.object({
  interests: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(100).optional(),
  })).max(10),
});

// PUT /api/profile/me/interests — Update user interests
export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { interests } = interestsSchema.parse(body);
    await profileService.updateInterests(user.id, interests);
    return apiSuccess({ message: 'Interests updated' });
  } catch (error) {
    return apiError(error);
  }
});
