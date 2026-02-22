import { NextRequest } from 'next/server';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal — Hub data (regions summary, counts)
export async function GET(_req: NextRequest) {
  try {
    const data = await portalService.getHubData();
    return apiSuccess(data);
  } catch (error) {
    return apiError(error);
  }
}
