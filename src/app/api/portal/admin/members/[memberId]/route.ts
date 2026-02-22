import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// PUT /api/portal/admin/members/:memberId — Accept, reject, change role, or remove
export const PUT = withAuth(
  withPermission('portal', 'manage_members', async (req, { params, user }) => {
    try {
      const body = await req.json();
      const { action, role } = body;

      let result;
      switch (action) {
        case 'accept':
          result = await portalService.adminAcceptMember(params.memberId, user.id);
          break;
        case 'reject':
          result = await portalService.adminRejectMember(params.memberId, user.id);
          break;
        case 'change_role':
          if (!role) {
            return apiError(new Error('Role is required for change_role action'));
          }
          result = await portalService.adminChangeMemberRole(params.memberId, role, user.id);
          break;
        case 'remove':
          result = await portalService.adminRemoveMember(params.memberId, user.id);
          break;
        default:
          return apiError(new Error('Invalid action. Use: accept, reject, change_role, remove'));
      }

      return apiSuccess(result);
    } catch (error) {
      return apiError(error);
    }
  })
);
