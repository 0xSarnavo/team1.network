import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';

// GET /api/portal/regions/[slug]/manage — Region admin data (for leads)
export const GET = withAuth(async (_req, { user, params }) => {
  try {
    const data = await portalService.getRegionAdminData(params.slug, user.id);
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
});

const addMemberSchema = z.object({
  email: z.string().email(),
  role: z.string().optional(),
});

// POST /api/portal/regions/[slug]/manage — Add member to region
export const POST = withAuth(async (req, { user, params }) => {
  try {
    const body = await req.json();
    const data = addMemberSchema.parse(body);
    const result = await portalService.regionLeadAddMember(params.slug, user.id, data);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
});
