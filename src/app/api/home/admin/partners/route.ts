import { NextRequest } from 'next/server';
import { withAuth } from '@/lib/middleware/auth.middleware';
import { withPermission } from '@/lib/middleware/permissions.middleware';
import { homeService } from '@/lib/services/home.service';
import { apiSuccess, apiCreated, apiError } from '@/lib/helpers/api-response';
import { parsePaginationParams, getPaginationMeta } from '@/lib/helpers/pagination';

// ============================================================
// GET /api/home/admin/partners
// List all partners (admin, paginated)
// ============================================================

export const GET = withAuth(
  withPermission('home', 'edit_partners', async (req, { user }) => {
    try {
      const { searchParams } = new URL(req.url);
      const { page, limit } = parsePaginationParams(searchParams);

      const { partners, total } = await homeService.listPartners(page, limit);
      const pagination = getPaginationMeta(page, limit, total);

      return apiSuccess(partners, pagination);
    } catch (error) {
      return apiError(error);
    }
  })
);

// ============================================================
// POST /api/home/admin/partners
// Create a new partner
// ============================================================

export const POST = withAuth(
  withPermission('home', 'edit_partners', async (req, { user }) => {
    try {
      const body = await req.json();
      const partner = await homeService.createPartner(body);
      return apiCreated(partner);
    } catch (error) {
      return apiError(error);
    }
  })
);
