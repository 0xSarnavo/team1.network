import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { updateProfileSchema } from '@/lib/helpers/validation';

// GET /api/profile/me — Get current user's full profile
export const GET = withAuth(async (_req, { user }) => {
  try {
    const profile = await profileService.getMyProfile(user.id);
    return apiSuccess(profile);
  } catch (error) {
    return apiError(error);
  }
});

// PUT /api/profile/me — Update profile fields
export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const data = updateProfileSchema.parse(body);
    const updated = await profileService.updateProfile(user.id, data);
    return apiSuccess({ message: 'Profile updated', user: updated });
  } catch (error) {
    return apiError(error);
  }
});
