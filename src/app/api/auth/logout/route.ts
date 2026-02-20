import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// ============================================================
// POST /api/auth/logout
// Invalidate current session
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const refreshToken = req.cookies.get('refresh_token')?.value;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    const response = apiSuccess({ message: 'Logged out successfully' });

    // Clear refresh token cookie
    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
