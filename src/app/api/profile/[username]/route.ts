import { NextRequest } from 'next/server';
import { withOptionalAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/profile/:username — Public profile (privacy-aware)
export const GET = withOptionalAuth(async (_req, { params, user }) => {
  try {
    const profile = await profileService.getPublicProfile(params.username, user?.id);
    return apiSuccess(profile);
  } catch (error) {
    return apiError(error);
  }
});
