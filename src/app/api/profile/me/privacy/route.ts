import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';

// GET /api/profile/me/privacy — Get privacy settings
export const GET = withAuth(async (_req, { user }) => {
  try {
    const settings = await profileService.getPrivacySettings(user.id);
    return apiSuccess(settings);
  } catch (error) {
    return apiError(error);
  }
});

const privacySchema = z.record(z.string(), z.boolean());

// PUT /api/profile/me/privacy — Update privacy settings
export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const settings = privacySchema.parse(body);
    await profileService.updatePrivacySettings(user.id, settings);
    return apiSuccess({ message: 'Privacy settings updated' });
  } catch (error) {
    return apiError(error);
  }
});
