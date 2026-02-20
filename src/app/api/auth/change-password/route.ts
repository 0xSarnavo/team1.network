import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { AppError } from '@/lib/helpers/errors';
import { passwordSchema } from '@/lib/helpers/validation';
import { auditService } from '@/lib/services/audit.service';
import db from '@/lib/db/client';
import bcrypt from 'bcryptjs';
import { AUTH } from '@/lib/config/constants';
import { z } from 'zod';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// POST /api/auth/change-password
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    const dbUser = await db.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!dbUser?.passwordHash) {
      throw new AppError('VALIDATION_ERROR', 'Account uses social login. Set a password first.');
    }

    const valid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
    if (!valid) {
      throw new AppError('INVALID_CREDENTIALS', 'Current password is incorrect');
    }

    const hash = await bcrypt.hash(newPassword, AUTH.BCRYPT_ROUNDS);
    await db.user.update({ where: { id: user.id }, data: { passwordHash: hash } });

    await auditService.log({
      userId: user.id,
      module: 'auth',
      action: 'auth.password.changed',
      severity: 'sensitive',
    });

    return apiSuccess({ message: 'Password changed successfully' });
  } catch (error) {
    return apiError(error);
  }
});
