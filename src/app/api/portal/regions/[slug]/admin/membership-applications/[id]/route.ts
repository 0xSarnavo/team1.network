import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { membershipApplicationService } from '@/lib/services/membership-application.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// PATCH /api/portal/regions/[slug]/admin/membership-applications/[id] — Lead review
export const PATCH = withAuth(
  withRegionLead(async (req, { user, regionId, params }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const { recommendation, note } = body;

      if (!['recommend_approve', 'recommend_reject'].includes(recommendation)) {
        return apiError(new Error('Invalid recommendation. Use "recommend_approve" or "recommend_reject".'));
      }

      const result = await membershipApplicationService.leadReview(
        id,
        regionId,
        user.id,
        recommendation,
        note || '',
      );
      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
