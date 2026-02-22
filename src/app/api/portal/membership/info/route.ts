import { NextRequest } from 'next/server';
import { portalService } from '@/lib/services/portal.service';
import { apiSuccess, apiError } from '@/lib/helpers/api-response';

// GET /api/portal/membership/info — Membership info (available regions)
export async function GET(_req: NextRequest) {
  try {
    const info = await portalService.getMembershipInfo();
    return apiSuccess(info);
  } catch (error) {
    return apiError(error);
  }
}
