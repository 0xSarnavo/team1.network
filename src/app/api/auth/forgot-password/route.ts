import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { forgotPasswordSchema } from '@/lib/helpers/validation';
import { checkRateLimit } from '@/lib/middleware/rateLimit.middleware';
import { AUTH } from '@/lib/config/constants';

// ============================================================
// POST /api/auth/forgot-password
// Request password reset email
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    // Rate limit: 3 per hour per email
    const rl = await checkRateLimit(email, {
      max: AUTH.RATE_LIMIT.FORGOT_PASSWORD.max,
      windowSeconds: AUTH.RATE_LIMIT.FORGOT_PASSWORD.windowHours * 60 * 60,
      keyPrefix: 'auth:forgot',
    });

    if (!rl.allowed) {
      // Still return success to avoid enumeration
      return apiSuccess({ message: 'If an account with that email exists, we sent a reset link' });
    }

    const result = await authService.forgotPassword(email);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
