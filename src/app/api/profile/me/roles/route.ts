import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';

const rolesSchema = z.object({
  roles: z.array(z.object({
    role: z.string().min(1).max(100),
    detail: z.string().max(255).optional(),
  })).max(3),
});

// PUT /api/profile/me/roles — Update profile roles
export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { roles } = rolesSchema.parse(body);
    await profileService.updateRoles(user.id, roles);
    return apiSuccess({ message: 'Roles updated' });
  } catch (error) {
    return apiError(error);
  }
});
