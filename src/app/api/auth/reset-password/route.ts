import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { resetPasswordSchema } from '@/lib/helpers/validation';

// ============================================================
// POST /api/auth/reset-password
// Reset password with token
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = resetPasswordSchema.parse(body);

    const result = await authService.resetPassword(token, password);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
