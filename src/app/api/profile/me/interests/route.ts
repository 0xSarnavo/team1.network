import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';
import db from '@/lib/db/client';

const interestsSchema = z.object({
  interests: z.array(z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(100).optional(),
  })).max(10),
});

const addInterestSchema = z.object({
  name: z.string().min(1).max(100),
});

// GET /api/profile/me/interests — Get user's interests
export const GET = withAuth(async (_req, { user }) => {
  try {
    const userInterests = await db.userInterest.findMany({
      where: { userId: user.id },
      include: { interest: true },
    });
    return apiSuccess(userInterests.map(ui => ({ id: ui.interest.id, name: ui.interest.name })));
  } catch (error) {
    return apiError(error);
  }
});

// PUT /api/profile/me/interests — Batch update user interests
export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { interests } = interestsSchema.parse(body);
    await db.userInterest.deleteMany({ where: { userId: user.id } });
    for (const item of interests.slice(0, 10)) {
      let interestId: string;
      if (item.id) {
        interestId = item.id;
      } else if (item.name) {
        const interest = await db.interest.upsert({
          where: { name: item.name },
          update: {},
          create: { name: item.name, isPredefined: false },
        });
        interestId = interest.id;
      } else continue;
      await db.userInterest.create({ data: { userId: user.id, interestId } });
    }
    return apiSuccess({ message: 'Interests updated' });
  } catch (error) {
    return apiError(error);
  }
});

// POST /api/profile/me/interests — Add a single interest
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { name } = addInterestSchema.parse(body);
    const interest = await db.interest.upsert({
      where: { name },
      update: {},
      create: { name, isPredefined: false },
    });
    const existing = await db.userInterest.findFirst({
      where: { userId: user.id, interestId: interest.id },
    });
    if (!existing) {
      const count = await db.userInterest.count({ where: { userId: user.id } });
      if (count >= 10) {
        return apiError({ code: 'VALIDATION_ERROR', message: 'Maximum 10 interests allowed', statusCode: 422 });
      }
      await db.userInterest.create({ data: { userId: user.id, interestId: interest.id } });
    }
    return apiSuccess({ id: interest.id, name: interest.name });
  } catch (error) {
    return apiError(error);
  }
});
