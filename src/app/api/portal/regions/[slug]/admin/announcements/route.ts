import { withAuth } from '@/lib/middleware/auth.middleware';
import { withRegionLead } from '@/lib/middleware/region-lead.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';

export const GET = withAuth(
  withRegionLead(async (_req, { regionId }) => {
    try {
      const announcements = await portalService.listRegionAnnouncementsAdmin(regionId);
      return apiSuccess(announcements);
    } catch (error) {
      return apiError(error);
    }
  })
);

export const POST = withAuth(
  withRegionLead(async (req, { regionId, user }) => {
    try {
      const body = await req.json();
      const announcement = await portalService.createRegionAnnouncement(regionId, body, user.id);
      return apiCreated(announcement);
    } catch (error) {
      return apiError(error);
    }
  })
);
