import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';

const socialsSchema = z.object({
  platforms: z.array(z.object({
    platform: z.string().min(1).max(50),
    handle: z.string().max(255),
    url: z.string().url().optional().or(z.literal('')),
    isPublic: z.boolean().optional(),
  })).max(10),
  customLinks: z.array(z.object({
    label: z.string().min(1).max(100),
    url: z.string().url().max(2000),
    isPublic: z.boolean().optional(),
  })).max(10),
});

// PUT /api/profile/me/socials — Update social links
export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const data = socialsSchema.parse(body);
    await profileService.updateSocials(user.id, data);
    return apiSuccess({ message: 'Social links updated' });
  } catch (error) {
    return apiError(error);
  }
});
