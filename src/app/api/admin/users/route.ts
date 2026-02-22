import { withAuth } from '@/lib/middleware/auth.middleware';
import { withAdminAccess } from '@/lib/middleware/permissions.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import db from '@/lib/db/client';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// GET /api/admin/users — List all users
export const GET = withAuth(
  withAdminAccess(async (req, { user }) => {
    try {
      const url = new URL(req.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const search = url.searchParams.get('search') || '';

      const where: Record<string, unknown> = {};
      if (search) {
        where.OR = [
          { displayName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { username: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        db.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            level: true,
            totalXp: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            regionMemberships: {
              where: { isActive: true },
              include: { region: { select: { id: true, name: true, slug: true } } },
            },
            platformAdmin: { select: { role: true } },
          },
        }),
        db.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return apiSuccess(
        users.map(u => ({
          id: u.id,
          email: u.email,
          username: u.username,
          displayName: u.displayName,
          avatarUrl: u.avatarUrl,
          level: u.level,
          totalXp: u.totalXp,
          isActive: u.isActive,
          emailVerified: u.emailVerified,
          createdAt: u.createdAt,
          platformRole: u.platformAdmin?.role || null,
          regions: u.regionMemberships.map(m => ({
            id: m.region.id, name: m.region.name, slug: m.region.slug, role: m.role,
          })),
        })),
        { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 }
      );
    } catch (error) {
      return apiError(error);
    }
  })
);

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  displayName: z.string().min(1).max(200),
  username: z.string().min(3).max(50).optional(),
});

// POST /api/admin/users — Create a new user (admin only)
export const POST = withAuth(
  withAdminAccess(async (req, { user }) => {
    try {
      const body = await req.json();
      const data = createUserSchema.parse(body);

      const existing = await db.user.findUnique({ where: { email: data.email } });
      if (existing) {
        return apiError({ code: 'CONFLICT', message: 'Email already registered', statusCode: 409 });
      }

      if (data.username) {
        const existingUsername = await db.user.findUnique({ where: { username: data.username } });
        if (existingUsername) {
          return apiError({ code: 'CONFLICT', message: 'Username already taken', statusCode: 409 });
        }
      }

      const passwordHash = await bcrypt.hash(data.password, 12);

      const newUser = await db.user.create({
        data: {
          email: data.email,
          passwordHash,
          displayName: data.displayName,
          username: data.username,
          emailVerified: true,
          emailVerifiedAt: new Date(),
          isActive: true,
          onboardingCompleted: true,
        },
      });

      return apiSuccess({
        id: newUser.id,
        email: newUser.email,
        displayName: newUser.displayName,
        username: newUser.username,
      });
    } catch (error) {
      return apiError(error);
    }
  })
);
