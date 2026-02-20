import { NextRequest } from 'next/server';
import { profileService } from '@/lib/services/profile.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/profile/skills?q=sol — Skill autocomplete
export async function GET(req: NextRequest) {
  try {
    const q = new URL(req.url).searchParams.get('q') || '';
    const skills = await profileService.searchSkills(q);
    return apiSuccess(skills);
  } catch (error) {
    return apiError(error);
  }
}
