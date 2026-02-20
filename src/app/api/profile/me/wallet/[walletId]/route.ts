import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// DELETE /api/profile/me/wallet/:walletId — Disconnect wallet
export const DELETE = withAuth(async (_req, { params, user }) => {
  try {
    await profileService.disconnectWallet(user.id, params.walletId);
    return apiSuccess({ message: 'Wallet disconnected' });
  } catch (error) {
    return apiError(error);
  }
});

// PUT /api/profile/me/wallet/:walletId — Set as primary
export const PUT = withAuth(async (_req, { params, user }) => {
  try {
    await profileService.setPrimaryWallet(user.id, params.walletId);
    return apiSuccess({ message: 'Primary wallet updated' });
  } catch (error) {
    return apiError(error);
  }
});
