import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';

const connectWalletSchema = z.object({
  address: z.string().min(10).max(100),
  chain: z.string().max(50).optional(),
  label: z.string().max(100).optional(),
  signature: z.string().optional(), // For future signature verification
});

// POST /api/profile/me/wallet — Connect a wallet
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const data = connectWalletSchema.parse(body);
    const wallet = await profileService.connectWallet(user.id, data);
    return apiSuccess(wallet);
  } catch (error) {
    return apiError(error);
  }
});
