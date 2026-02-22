import { NextRequest } from 'next/server';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/programs — List active programs
export async function GET(_req: NextRequest) {
  try {
    const programs = await portalService.listPrograms();
    return apiSuccess(programs);
  } catch (error) {
    return apiError(error);
  }
}
