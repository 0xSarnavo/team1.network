import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';
import db from '@/lib/db/client';

const rolesSchema = z.object({
  roles: z.array(z.object({
    role: z.string().min(1).max(100),
    detail: z.string().max(255).optional(),
  })).max(3),
});

const addRoleSchema = z.object({
  name: z.string().min(1).max(100),
  detail: z.string().max(255).optional(),
});

// GET /api/profile/me/roles — Get user's profile roles
export const GET = withAuth(async (_req, { user }) => {
  try {
    const roles = await db.userProfileRole.findMany({
      where: { userId: user.id },
    });
    return apiSuccess(roles.map(r => ({ id: r.id, name: r.role, detail: r.roleDetail })));
  } catch (error) {
    return apiError(error);
  }
});

// PUT /api/profile/me/roles — Batch update user roles
export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { roles } = rolesSchema.parse(body);
    await db.userProfileRole.deleteMany({ where: { userId: user.id } });
    for (const r of roles.slice(0, 3)) {
      await db.userProfileRole.create({
        data: { userId: user.id, role: r.role, roleDetail: r.detail },
      });
    }
    return apiSuccess({ message: 'Roles updated' });
  } catch (error) {
    return apiError(error);
  }
});

// POST /api/profile/me/roles — Add a single role
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { name, detail } = addRoleSchema.parse(body);
    const count = await db.userProfileRole.count({ where: { userId: user.id } });
    if (count >= 3) {
      return apiError({ code: 'VALIDATION_ERROR', message: 'Maximum 3 roles allowed', statusCode: 422 });
    }
    const role = await db.userProfileRole.create({
      data: { userId: user.id, role: name, roleDetail: detail },
    });
    return apiSuccess({ id: role.id, name: role.role, detail: role.roleDetail });
  } catch (error) {
    return apiError(error);
  }
});
