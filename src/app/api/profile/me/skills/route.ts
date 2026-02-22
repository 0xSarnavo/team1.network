import { withAuth } from '@/lib/middleware/auth.middleware';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';
import { z } from 'zod';
import db from '@/lib/db/client';

const skillsSchema = z.object({
  skills: z.array(z.string().min(1).max(100)).max(20),
});

const addSkillSchema = z.object({
  name: z.string().min(1).max(100),
});

// GET /api/profile/me/skills — Get user's skills
export const GET = withAuth(async (_req, { user }) => {
  try {
    const userSkills = await db.userSkill.findMany({
      where: { userId: user.id },
      include: { skill: true },
    });
    return apiSuccess(userSkills.map(us => ({ id: us.skill.id, name: us.skill.name })));
  } catch (error) {
    return apiError(error);
  }
});

// PUT /api/profile/me/skills — Batch update user skills
export const PUT = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { skills } = skillsSchema.parse(body);
    await db.userSkill.deleteMany({ where: { userId: user.id } });
    for (const name of skills) {
      const skill = await db.skill.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      await db.userSkill.create({ data: { userId: user.id, skillId: skill.id } });
    }
    return apiSuccess({ message: 'Skills updated' });
  } catch (error) {
    return apiError(error);
  }
});

// POST /api/profile/me/skills — Add a single skill
export const POST = withAuth(async (req, { user }) => {
  try {
    const body = await req.json();
    const { name } = addSkillSchema.parse(body);
    const skill = await db.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    // Check if already linked
    const existing = await db.userSkill.findFirst({
      where: { userId: user.id, skillId: skill.id },
    });
    if (!existing) {
      const count = await db.userSkill.count({ where: { userId: user.id } });
      if (count >= 20) {
        return apiError({ code: 'VALIDATION_ERROR', message: 'Maximum 20 skills allowed', statusCode: 422 });
      }
      await db.userSkill.create({ data: { userId: user.id, skillId: skill.id } });
    }
    return apiSuccess({ id: skill.id, name: skill.name });
  } catch (error) {
    return apiError(error);
  }
});
