import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/regions/[slug]/admin/programs
export const GET = withAuth(
  withRegionLead(async (req, { regionId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status') || undefined;
      const programs = await portalService.regionAdminListPrograms(regionId, { status });
      return apiSuccess(programs);
    } catch (error) {
      return apiError(error);
    }
  })
);

// POST /api/portal/regions/[slug]/admin/programs
export const POST = withAuth(
  withRegionLead(async (req, { regionId, user }) => {
    try {
      const body = await req.json();
      const program = await portalService.regionAdminCreateProgram(regionId, body, user.id);
      return apiCreated(program);
    } catch (error) {
      return apiError(error);
    }
  })
);
