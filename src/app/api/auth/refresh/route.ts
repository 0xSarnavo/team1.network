import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// POST /api/auth/refresh
// Refresh access token using refresh token from cookie
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (!refreshToken) {
      return apiError({
        code: 'UNAUTHORIZED',
        message: 'No refresh token provided',
        statusCode: 401,
      });
    }

    const result = await authService.refreshTokens(refreshToken);

    const response = apiSuccess({ accessToken: result.accessToken });

    // Set new refresh token cookie
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
