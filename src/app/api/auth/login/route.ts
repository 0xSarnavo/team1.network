import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { loginSchema } from '@/lib/helpers/validation';
import { checkRateLimit } from '@/lib/middleware/rateLimit.middleware';
import { AUTH } from '@/lib/config/constants';

// ============================================================
// POST /api/auth/login
// Email + password login (fallback for non-Builder Hub auth)
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    // Rate limit: 5 attempts per 15 minutes per email
    const rl = await checkRateLimit(email, {
      max: AUTH.RATE_LIMIT.LOGIN.max,
      windowSeconds: AUTH.RATE_LIMIT.LOGIN.windowMinutes * 60,
      keyPrefix: 'auth:login',
    });

    if (!rl.allowed) {
      const minutes = Math.ceil(rl.resetIn / 60);
      return apiError({
        code: 'RATE_LIMITED',
        message: `Too many login attempts. Try again in ${minutes} minute(s).`,
        statusCode: 429,
      });
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';

    const result = await authService.login({
      email,
      password,
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    // If 2FA required, return temp token (no session created yet)
    if (result.requires2fa) {
      return apiSuccess({
        requires2fa: true,
        tempToken: result.tempToken,
      });
    }

    const response = apiSuccess({
      accessToken: result.accessToken,
      user: result.user,
    });

    // Set refresh token as HTTP-only cookie
    response.cookies.set('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 30 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
