import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { checkRateLimit } from '@/lib/middleware/rateLimit.middleware';
import { z } from 'zod';

// ============================================================
// POST /api/auth/builder-hub
// Primary auth endpoint — validates Builder Hub JWT and
// creates/syncs user, issues our own tokens.
// ============================================================

const builderHubLoginSchema = z.object({
  token: z.string().min(1, 'Builder Hub token is required'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = builderHubLoginSchema.parse(body);

    // Rate limit by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rl = await checkRateLimit(ip, {
      max: 20,
      windowSeconds: 60,
      keyPrefix: 'auth:builder-hub',
    });

    if (!rl.allowed) {
      return apiError({ code: 'RATE_LIMITED', message: 'Too many attempts. Try again later.', statusCode: 429 });
    }

    const result = await authService.loginWithBuilderHub({
      builderHubToken: token,
      ipAddress: ip,
      userAgent: req.headers.get('user-agent') || undefined,
    });

    // Set refresh token as HTTP-only cookie
    const response = apiSuccess({
      accessToken: result.accessToken,
      user: result.user,
      isNewUser: result.isNewUser,
    });

    response.cookies.set('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
