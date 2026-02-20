import { NextRequest } from 'next/server';
import { authService } from '@/lib/services/auth.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { verifyEmailSchema } from '@/lib/helpers/validation';

// ============================================================
// POST /api/auth/verify-email
// Verify email with token
// ============================================================

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = verifyEmailSchema.parse(body);

    const result = await authService.verifyEmail(token);
    return apiSuccess(result);
  } catch (error) {
    return apiError(error);
  }
}
