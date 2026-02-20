import { withOptionalAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';

// GET /api/profile/:username/content — User's content (bounty wins, maps, grants)
export const GET = withOptionalAuth(async (_req, { params }) => {
  try {
    const target = await db.user.findUnique({
      where: { username: params.username },
      select: { id: true },
    });
    if (!target) return apiError({ code: 'NOT_FOUND', message: 'User not found', statusCode: 404 });

    // Content will be populated when bounty/ecosystem/grants modules are built
    // For now return empty structure
    return apiSuccess({
      bountySubmissions: [],
      ecosystemMaps: [],
      grantProjects: [],
    });
  } catch (error) {
    return apiError(error);
  }
});
