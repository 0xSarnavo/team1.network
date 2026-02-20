import { withAuth } from '@/lib/middleware/auth.middleware';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';

const shippingSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().min(1).max(1000),
  notes: z.string().max(500).optional(),
});

// PUT /api/profile/me/rewards/:rewardId/shipping
export const PUT = withAuth(async (req, { params, user }) => {
  try {
    const body = await req.json();
    const data = shippingSchema.parse(body);
    const result = await profileService.submitShipping(user.id, params.rewardId, data);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
});
