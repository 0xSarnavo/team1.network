import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

export const PATCH = withAuth(
  withRegionLead(async (req, { regionId, params }) => {
    try {
      const { stage } = await req.json();
      const proposal = await portalService.updateProposalStage(params.proposalId, regionId, stage);
      return apiSuccess(proposal);
    } catch (error) {
      return apiError(error);
    }
  })
);
