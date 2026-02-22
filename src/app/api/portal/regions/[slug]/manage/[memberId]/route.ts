import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';

const updateRoleSchema = z.object({
  role: z.string().min(1),
});

// PUT /api/portal/regions/[slug]/manage/[memberId] — Change member role
export const PUT = withAuth(async (req, { user, params }) => {
  try {
    const body = await req.json();
    const { role } = updateRoleSchema.parse(body);
    const result = await portalService.adminChangeMemberRole(params.memberId, role, user.id);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
});

// DELETE /api/portal/regions/[slug]/manage/[memberId] — Remove member
export const DELETE = withAuth(async (_req, { user, params }) => {
  try {
    const result = await portalService.adminRemoveMember(params.memberId, user.id);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
});
