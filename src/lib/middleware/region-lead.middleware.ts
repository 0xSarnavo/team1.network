import { NextRequest, NextResponse } from 'next/server';
import { apiError } from '@/lib/helpers/api-response';
import { AppError } from '@/lib/helpers/errors';
import type { AuthUser } from '@/types/api.types';
import db from '@/lib/db/client';

// ============================================================
// Region Lead Middleware
// ============================================================

interface RegionLeadContext {
  params: Record<string, string>;
  user: AuthUser;
  regionId: string;
}

type RegionLeadHandler = (
  req: NextRequest,
  context: RegionLeadContext
) => Promise<NextResponse>;

interface AuthenticatedContext {
  params: Record<string, string>;
  user: AuthUser;
}

type AuthenticatedHandler = (
  req: NextRequest,
  context: AuthenticatedContext
) => Promise<NextResponse>;

/**
 * Wraps a handler to verify the user is a region lead (or SSA/SA).
 * Resolves regionId from the `slug` param and injects it into handler context.
 */
export function withRegionLead(handler: RegionLeadHandler): AuthenticatedHandler {
  return async (req: NextRequest, context: AuthenticatedContext) => {
    const { user, params } = context;
    const slug = params.slug;

    if (!slug) {
      return apiError(new AppError('VALIDATION_ERROR', 'Region slug is required'));
    }

    // Resolve region from slug
    const region = await db.region.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!region) {
      return apiError(new AppError('NOT_FOUND', 'Region not found'));
    }

    // SSA / SA bypass — full access
    if (
      user.platformRole === 'super_super_admin' ||
      user.platformRole === 'super_admin'
    ) {
      return handler(req, { ...context, regionId: region.id });
    }

    // Check if user is lead/co_lead for this region
    const membership = await db.userRegionMembership.findUnique({
      where: { userId_regionId: { userId: user.id, regionId: region.id } },
      select: { role: true, status: true, isActive: true },
    });

    if (
      !membership ||
      membership.status !== 'accepted' ||
      !membership.isActive ||
      !['lead', 'co_lead'].includes(membership.role)
    ) {
      return apiError(
        new AppError('FORBIDDEN', 'Only region leads can access this resource')
      );
    }

    return handler(req, { ...context, regionId: region.id });
  };
}
