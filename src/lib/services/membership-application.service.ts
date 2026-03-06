import db from '@/lib/db/client';
import { AppError } from '@/lib/helpers/errors';
import { auditService } from './audit.service';

// ============================================================
// Membership Application Service
// ============================================================

interface SubmitApplicationData {
  fullName: string;
  email: string;
  telegram: string;
  xHandle: string;
  country: string;
  state: string;
  bio: string;
  resumeLink: string;
  skills: string[];
  whyJoin: string;
  howHelp: string;
  expectations: string;
  hoursWeekly: number;
  github?: string;
  referredBy?: string;
}

interface ListFilters {
  page?: number;
  limit?: number;
  status?: string;
  country?: string;
  search?: string;
}

class MembershipApplicationService {
  // ----------------------------------------------------------
  // Submit Application (User)
  // ----------------------------------------------------------

  async submitApplication(userId: string, data: SubmitApplicationData) {
    // Prevent duplicate active applications
    const existing = await db.membershipApplication.findFirst({
      where: {
        userId,
        status: { in: ['pending', 'assigned', 'lead_reviewed'] },
      },
    });

    if (existing) {
      throw new AppError('CONFLICT', 'You already have an active membership application');
    }

    const application = await db.membershipApplication.create({
      data: {
        userId,
        fullName: data.fullName,
        email: data.email,
        telegram: data.telegram,
        xHandle: data.xHandle,
        country: data.country,
        state: data.state,
        bio: data.bio,
        resumeLink: data.resumeLink,
        skills: data.skills,
        whyJoin: data.whyJoin,
        howHelp: data.howHelp,
        expectations: data.expectations,
        hoursWeekly: data.hoursWeekly,
        github: data.github || null,
        referredBy: data.referredBy || null,
        status: 'pending',
      },
    });

    return application;
  }

  // ----------------------------------------------------------
  // List Applications (Super Admin)
  // ----------------------------------------------------------

  async listApplications(filters: ListFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.country) where.country = filters.country;
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [applications, total] = await Promise.all([
      db.membershipApplication.findMany({
        where,
        include: {
          user: {
            select: { id: true, displayName: true, email: true, avatarUrl: true, username: true, level: true },
          },
          assignedRegion: {
            select: { id: true, name: true, slug: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.membershipApplication.count({ where }),
    ]);

    return {
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  // ----------------------------------------------------------
  // Get Application By ID
  // ----------------------------------------------------------

  async getApplicationById(id: string) {
    const application = await db.membershipApplication.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, displayName: true, email: true, avatarUrl: true, username: true, level: true },
        },
        assignedRegion: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!application) {
      throw new AppError('NOT_FOUND', 'Application not found');
    }

    return application;
  }

  // ----------------------------------------------------------
  // Get Distinct Countries (for filter dropdown)
  // ----------------------------------------------------------

  async getDistinctCountries() {
    const results = await db.membershipApplication.findMany({
      distinct: ['country'],
      select: { country: true },
      orderBy: { country: 'asc' },
    });
    return results.map(r => r.country);
  }

  // ----------------------------------------------------------
  // Assign to Region (Super Admin)
  // ----------------------------------------------------------

  async assignToRegion(appId: string, regionId: string, adminUserId: string) {
    const app = await db.membershipApplication.findUnique({ where: { id: appId } });
    if (!app) throw new AppError('NOT_FOUND', 'Application not found');
    if (app.status !== 'pending') {
      throw new AppError('CONFLICT', 'Application is not in pending status');
    }

    // Verify region exists
    const region = await db.region.findUnique({ where: { id: regionId }, select: { id: true, name: true } });
    if (!region) throw new AppError('NOT_FOUND', 'Region not found');

    const updated = await db.membershipApplication.update({
      where: { id: appId },
      data: { status: 'assigned', assignedRegionId: regionId },
    });

    await auditService.log({
      userId: adminUserId,
      module: 'membership',
      action: 'assign_application',
      entityType: 'membership_application',
      entityId: appId,
      details: { regionId, regionName: region.name },
    });

    return updated;
  }

  // ----------------------------------------------------------
  // Bulk Assign by Country (Super Admin)
  // ----------------------------------------------------------

  async bulkAssignByCountry(country: string, regionId: string, adminUserId: string) {
    const region = await db.region.findUnique({ where: { id: regionId }, select: { id: true, name: true } });
    if (!region) throw new AppError('NOT_FOUND', 'Region not found');

    const result = await db.membershipApplication.updateMany({
      where: { country, status: 'pending' },
      data: { status: 'assigned', assignedRegionId: regionId },
    });

    await auditService.log({
      userId: adminUserId,
      module: 'membership',
      action: 'bulk_assign_applications',
      details: { country, regionId, regionName: region.name, count: result.count },
    });

    return { count: result.count };
  }

  // ----------------------------------------------------------
  // Lead Review (Regional Lead)
  // ----------------------------------------------------------

  async leadReview(
    appId: string,
    regionId: string,
    leadUserId: string,
    recommendation: 'recommend_approve' | 'recommend_reject',
    note: string,
  ) {
    const app = await db.membershipApplication.findUnique({ where: { id: appId } });
    if (!app) throw new AppError('NOT_FOUND', 'Application not found');
    if (app.status !== 'assigned') {
      throw new AppError('CONFLICT', 'Application is not in assigned status');
    }
    if (app.assignedRegionId !== regionId) {
      throw new AppError('FORBIDDEN', 'Application is not assigned to your region');
    }

    const updated = await db.membershipApplication.update({
      where: { id: appId },
      data: {
        status: 'lead_reviewed',
        leadReviewStatus: recommendation,
        leadReviewNote: note,
        leadReviewedBy: leadUserId,
        leadReviewedAt: new Date(),
      },
    });

    await auditService.log({
      userId: leadUserId,
      module: 'membership',
      action: 'lead_review_application',
      entityType: 'membership_application',
      entityId: appId,
      details: { recommendation, note },
    });

    return updated;
  }

  // ----------------------------------------------------------
  // List Region Applications (Regional Lead)
  // ----------------------------------------------------------

  async listRegionApplications(regionId: string, status?: string) {
    const where: Record<string, unknown> = { assignedRegionId: regionId };
    if (status) {
      where.status = status;
    } else {
      where.status = { in: ['assigned', 'lead_reviewed'] };
    }

    return db.membershipApplication.findMany({
      where,
      include: {
        user: {
          select: { id: true, displayName: true, email: true, avatarUrl: true, username: true, level: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ----------------------------------------------------------
  // Final Decision (Super Admin)
  // ----------------------------------------------------------

  async finalDecision(
    appId: string,
    action: 'approve' | 'reject',
    adminUserId: string,
    note?: string,
  ) {
    const app = await db.membershipApplication.findUnique({ where: { id: appId } });
    if (!app) throw new AppError('NOT_FOUND', 'Application not found');
    if (app.status !== 'lead_reviewed') {
      throw new AppError('CONFLICT', 'Application has not been reviewed by a regional lead yet');
    }

    if (action === 'approve') {
      if (!app.assignedRegionId) {
        throw new AppError('CONFLICT', 'Application has no assigned region');
      }

      // Use transaction: update application + create membership
      const result = await db.$transaction(async (tx) => {
        const updated = await tx.membershipApplication.update({
          where: { id: appId },
          data: {
            status: 'approved',
            adminNote: note || null,
            resolvedBy: adminUserId,
            resolvedAt: new Date(),
          },
        });

        // Create UserRegionMembership
        await tx.userRegionMembership.upsert({
          where: { userId_regionId: { userId: app.userId, regionId: app.assignedRegionId! } },
          create: {
            userId: app.userId,
            regionId: app.assignedRegionId!,
            role: 'member',
            status: 'accepted',
            isPrimary: true,
            isActive: true,
            acceptedAt: new Date(),
          },
          update: {
            status: 'accepted',
            isActive: true,
            acceptedAt: new Date(),
          },
        });

        return updated;
      });

      await auditService.log({
        userId: adminUserId,
        module: 'membership',
        action: 'approve_application',
        entityType: 'membership_application',
        entityId: appId,
        details: { regionId: app.assignedRegionId },
      });

      return result;
    } else {
      // Reject
      const updated = await db.membershipApplication.update({
        where: { id: appId },
        data: {
          status: 'rejected',
          adminNote: note || null,
          resolvedBy: adminUserId,
          resolvedAt: new Date(),
        },
      });

      await auditService.log({
        userId: adminUserId,
        module: 'membership',
        action: 'reject_application',
        entityType: 'membership_application',
        entityId: appId,
        details: { note },
      });

      return updated;
    }
  }
}

export const membershipApplicationService = new MembershipApplicationService();
