import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';

export const GET = withAuth(
  withRegionLead(async (req, { regionId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get('status') || undefined;
      const playbooks = await portalService.listRegionPlaybooks(regionId, { status });
      return apiSuccess(playbooks);
    } catch (error) {
      return apiError(error);
    }
  })
);

export const POST = withAuth(
  withRegionLead(async (req, { regionId, user }) => {
    try {
      const body = await req.json();
      const playbook = await portalService.createRegionPlaybook(regionId, body, user.id);
      return apiCreated(playbook);
    } catch (error) {
      return apiError(error);
    }
  })
);
