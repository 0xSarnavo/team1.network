import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';
import db from '@/lib/db/client';

const socialsSchema = z.object({
  platforms: z.array(z.object({
    platform: z.string().min(1).max(50),
    handle: z.string().max(255),
    url: z.string().url().optional().or(z.literal('')),
    isPublic: z.boolean().optional(),
  })).max(10),
  customLinks: z.array(z.object({
    label: z.string().min(1).max(100),
    url: z.string().url().max(2000),
    isPublic: z.boolean().optional(),
  })).max(10),
});

const addSocialSchema = z.object({
  platform: z.string().min(1).max(50),
  url: z.string().url().max(2000),
});

// GET /api/profile/me/socials — Get user's social links
export const GET = withAuth(async (_req, { user }) => {
  try {
    const links = await db.userSocialLink.findMany({
      where: { userId: user.id },
      orderBy: { sortOrder: 'asc' },
    });
    return apiSuccess(links.map(l => ({
      id: l.id,
      platform: l.platform,
      handle: l.handle,
      url: l.url,
      isPublic: l.isPublic,
    })));
  } catch (error) {
    return apiError(error);
  }
});

// PUT /api/profile/me/socials — Batch update social links
export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const data = socialsSchema.parse(body);
    await db.$transaction(async (tx) => {
      await tx.userSocialLink.deleteMany({ where: { userId: user.id } });
      for (let i = 0; i < data.platforms.length; i++) {
        const p = data.platforms[i];
        if (!p.handle) continue;
        await tx.userSocialLink.create({
          data: {
            userId: user.id,
            platform: p.platform,
            handle: p.handle,
            url: p.url,
            isPublic: p.isPublic ?? true,
            sortOrder: i,
          },
        });
      }
      await tx.userCustomLink.deleteMany({ where: { userId: user.id } });
      for (let i = 0; i < data.customLinks.length; i++) {
        const l = data.customLinks[i];
        await tx.userCustomLink.create({
          data: {
            userId: user.id,
            label: l.label,
            url: l.url,
            isPublic: l.isPublic ?? true,
            sortOrder: i,
          },
        });
      }
    });
    return apiSuccess({ message: 'Social links updated' });
  } catch (error) {
    return apiError(error);
  }
});

// POST /api/profile/me/socials — Add a single social link
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { platform, url } = addSocialSchema.parse(body);
    const count = await db.userSocialLink.count({ where: { userId: user.id } });
    if (count >= 10) {
      return apiError({ code: 'VALIDATION_ERROR', message: 'Maximum 10 social links allowed', statusCode: 422 });
    }
    const link = await db.userSocialLink.create({
      data: {
        userId: user.id,
        platform,
        handle: platform,
        url,
        isPublic: true,
        sortOrder: count,
      },
    });
    return apiSuccess({ id: link.id, platform: link.platform, url: link.url });
  } catch (error) {
    return apiError(error);
  }
});
