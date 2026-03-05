import { withAuth } from '@/lib/middleware/auth.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiCreated, apiError } from '@/lib/helpers/api-response';

export const POST = withAuth(async (req, { params, user }) => {
  try {
    const { body } = await req.json();
    const comment = await portalService.addProposalComment(params.proposalId, body, user.id);
    return apiCreated(comment);
  } catch (error) {
    return apiError(error);
  }
});
