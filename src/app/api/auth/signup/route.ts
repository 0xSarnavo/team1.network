import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { apiCreated, apiError } from '@/lib/helpers/api-response';
import { signupSchema } from '@/lib/helpers/validation';
import { checkRateLimit } from '@/lib/middleware/rateLimit.middleware';
import { AUTH } from '@/lib/config/constants';

// ============================================================
// POST /api/auth/signup
// Email + password registration
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, displayName } = signupSchema.parse(body);

    // Rate limit: 3 signups per IP per hour
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(ip, {
      max: AUTH.RATE_LIMIT.SIGNUP.max,
      windowSeconds: AUTH.RATE_LIMIT.SIGNUP.windowHours * 60 * 60,
      keyPrefix: 'auth:signup',
    });

    if (!rl.allowed) {
      return apiError({
        code: 'RATE_LIMITED',
        message: 'Too many signups. Please try again later.',
        statusCode: 429,
      });
    }

    const result = await authService.signup({
      email,
      password,
      displayName,
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    return apiCreated(result);
  } catch (error) {
    return apiError(error);
  }
}
