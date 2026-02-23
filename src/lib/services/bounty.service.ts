import { PrismaClient } from '@prisma/client';
import db from '@/lib/db/client';
import { AppError } from '@/lib/helpers/errors';
import { auditService } from './audit.service';
import { xpService } from './xp.service';
import { XP } from '@/lib/config/constants';

// ============================================================
// Bounty Service
// ============================================================

class BountyService {
  // ----------------------------------------------------------
  // Public: List global bounties (regionId IS NULL, status=active)
  // ----------------------------------------------------------

  async listPublicBounties(filters: {
    page: number;
    limit: number;
    category?: string;
    search?: string;
  }) {
    const where: Record<string, unknown> = {
      regionId: null,
      status: 'active',
    };
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [bounties, total] = await Promise.all([
      db.bounty.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          _count: { select: { submissions: true } },
          creator: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      }),
      db.bounty.count({ where }),
    ]);

    return {
      bounties: bounties.map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description,
        category: b.category,
        xpReward: b.xpReward,
        type: b.type,
        status: b.status,
        maxSubmissions: b.maxSubmissions,
        startsAt: b.startsAt,
        endsAt: b.endsAt,
        proofRequirements: b.proofRequirements,
        submissionCount: b._count.submissions,
        creator: b.creator,
        createdAt: b.createdAt,
      })),
      total,
    };
  }

  // ----------------------------------------------------------
  // Public: Get bounty detail
  // ----------------------------------------------------------

  async getBountyById(bountyId: string, userId?: string) {
    const bounty = await db.bounty.findUnique({
      where: { id: bountyId },
      include: {
        submissions: userId
          ? {
              where: { userId },
              orderBy: { createdAt: 'desc' as const },
              select: { id: true, status: true, proofUrl: true, proofText: true, rejectNote: true, xpAwarded: true, createdAt: true },
            }
          : false,
        _count: { select: { submissions: true } },
        creator: { select: { id: true, displayName: true, avatarUrl: true } },
        region: { select: { id: true, name: true, slug: true } },
      },
    });

    if (!bounty) throw new AppError('NOT_FOUND', 'Bounty not found');

    return {
      id: bounty.id,
      title: bounty.title,
      description: bounty.description,
      category: bounty.category,
      xpReward: bounty.xpReward,
      type: bounty.type,
      regionId: bounty.regionId,
      region: bounty.region,
      status: bounty.status,
      maxSubmissions: bounty.maxSubmissions,
      startsAt: bounty.startsAt,
      endsAt: bounty.endsAt,
      proofRequirements: bounty.proofRequirements,
      submissionCount: bounty._count.submissions,
      mySubmissions: userId && Array.isArray(bounty.submissions) ? bounty.submissions : [],
      creator: bounty.creator,
      createdAt: bounty.createdAt,
      updatedAt: bounty.updatedAt,
    };
  }

  // ----------------------------------------------------------
  // Auth: Submit proof for a bounty
  // ----------------------------------------------------------

  async submitProof(bountyId: string, userId: string, data: { proofUrl?: string; proofText?: string }) {
    const bounty = await db.bounty.findUnique({
      where: { id: bountyId },
      include: { _count: { select: { submissions: true } } },
    });
    if (!bounty) throw new AppError('NOT_FOUND', 'Bounty not found');
    if (bounty.status !== 'active') throw new AppError('VALIDATION_ERROR', 'Bounty is not active');

    if (bounty.endsAt && new Date() > bounty.endsAt) {
      throw new AppError('VALIDATION_ERROR', 'Bounty submission period has ended');
    }

    if (bounty.maxSubmissions && bounty._count.submissions >= bounty.maxSubmissions) {
      throw new AppError('VALIDATION_ERROR', 'Maximum submissions reached for this bounty');
    }

    // For one_time bounties, only allow one submission per user
    if (bounty.type === 'one_time') {
      const existing = await db.bountySubmission.findFirst({
        where: { bountyId, userId },
      });
      if (existing) throw new AppError('CONFLICT', 'You have already submitted for this bounty');
    }

    // If regional bounty, check membership
    if (bounty.regionId) {
      const membership = await db.userRegionMembership.findFirst({
        where: { userId, regionId: bounty.regionId, status: 'accepted', isActive: true },
      });
      if (!membership) throw new AppError('FORBIDDEN', 'This bounty is for region members only');
    }

    const submission = await db.bountySubmission.create({
      data: {
        bountyId,
        userId,
        proofUrl: data.proofUrl,
        proofText: data.proofText,
      },
    });

    return { message: 'Proof submitted', submissionId: submission.id };
  }

  // ----------------------------------------------------------
  // Auth: User's own submissions
  // ----------------------------------------------------------

  async getMySubmissions(userId: string, page: number = 1, limit: number = 20) {
    const [submissions, total] = await Promise.all([
      db.bountySubmission.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          bounty: {
            select: { id: true, title: true, category: true, xpReward: true, type: true },
          },
        },
      }),
      db.bountySubmission.count({ where: { userId } }),
    ]);

    return {
      submissions: submissions.map((s) => ({
        id: s.id,
        bountyId: s.bounty.id,
        bountyTitle: s.bounty.title,
        category: s.bounty.category,
        xpReward: s.bounty.xpReward,
        bountyType: s.bounty.type,
        status: s.status,
        proofUrl: s.proofUrl,
        proofText: s.proofText,
        rejectNote: s.rejectNote,
        xpAwarded: s.xpAwarded,
        submittedAt: s.createdAt,
        reviewedAt: s.reviewedAt,
      })),
      total,
    };
  }

  // ----------------------------------------------------------
  // Auth+Member: List regional bounties
  // ----------------------------------------------------------

  async listRegionBounties(regionId: string, userId: string, filters: {
    page: number;
    limit: number;
    category?: string;
  }) {
    // Verify membership
    const membership = await db.userRegionMembership.findFirst({
      where: { userId, regionId, status: 'accepted', isActive: true },
    });
    if (!membership) throw new AppError('FORBIDDEN', 'You must be a member of this region');

    const where: Record<string, unknown> = {
      regionId,
      status: 'active',
    };
    if (filters.category) where.category = filters.category;

    const [bounties, total] = await Promise.all([
      db.bounty.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          _count: { select: { submissions: true } },
          creator: { select: { id: true, displayName: true, avatarUrl: true } },
        },
      }),
      db.bounty.count({ where }),
    ]);

    return {
      bounties: bounties.map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description,
        category: b.category,
        xpReward: b.xpReward,
        type: b.type,
        status: b.status,
        maxSubmissions: b.maxSubmissions,
        startsAt: b.startsAt,
        endsAt: b.endsAt,
        proofRequirements: b.proofRequirements,
        submissionCount: b._count.submissions,
        creator: b.creator,
        createdAt: b.createdAt,
      })),
      total,
    };
  }

  // ----------------------------------------------------------
  // Admin: Check if user is lead or reviewer for a region
  // ----------------------------------------------------------

  async isRegionLeadOrReviewer(userId: string, regionId: string): Promise<{ isLead: boolean; isReviewer: boolean; canCreate: boolean }> {
    const membership = await db.userRegionMembership.findFirst({
      where: { userId, regionId, status: 'accepted', isActive: true, role: { in: ['lead', 'co_lead'] } },
    });
    const isLead = !!membership;

    if (isLead) return { isLead: true, isReviewer: true, canCreate: true };

    const reviewer = await db.bountyReviewer.findUnique({
      where: { regionId_userId: { regionId, userId } },
    });

    return {
      isLead: false,
      isReviewer: !!reviewer,
      canCreate: !!reviewer?.canCreate,
    };
  }

  // ----------------------------------------------------------
  // Admin: List bounties for management
  // ----------------------------------------------------------

  async adminListBounties(filters: {
    page: number;
    limit: number;
    regionId?: string;
    status?: string;
    category?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (filters.regionId) where.regionId = filters.regionId;
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;

    const [bounties, total] = await Promise.all([
      db.bounty.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          _count: { select: { submissions: true } },
          creator: { select: { id: true, displayName: true, avatarUrl: true } },
          region: { select: { id: true, name: true, slug: true } },
        },
      }),
      db.bounty.count({ where }),
    ]);

    return {
      bounties: bounties.map((b) => ({
        id: b.id,
        title: b.title,
        description: b.description,
        category: b.category,
        xpReward: b.xpReward,
        type: b.type,
        regionId: b.regionId,
        region: b.region,
        status: b.status,
        maxSubmissions: b.maxSubmissions,
        startsAt: b.startsAt,
        endsAt: b.endsAt,
        proofRequirements: b.proofRequirements,
        submissionCount: b._count.submissions,
        creator: b.creator,
        createdAt: b.createdAt,
        updatedAt: b.updatedAt,
      })),
      total,
    };
  }

  // ----------------------------------------------------------
  // Admin: Create bounty
  // ----------------------------------------------------------

  async createBounty(data: {
    title: string;
    description: string;
    category: string;
    xpReward: number;
    type?: string;
    status?: string;
    regionId?: string;
    maxSubmissions?: number;
    startsAt?: string;
    endsAt?: string;
    proofRequirements?: string;
  }, userId: string) {
    const bounty = await db.bounty.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category as any,
        xpReward: data.xpReward,
        type: (data.type as any) || 'one_time',
        status: (data.status as any) || 'draft',
        regionId: data.regionId || null,
        maxSubmissions: data.maxSubmissions || null,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        proofRequirements: data.proofRequirements || null,
        createdBy: userId,
      },
    });

    await auditService.log({
      userId,
      module: 'bounty',
      action: 'bounty.created',
      entityType: 'bounty',
      entityId: bounty.id,
      entityName: bounty.title,
    });

    return bounty;
  }

  // ----------------------------------------------------------
  // Admin: Update bounty
  // ----------------------------------------------------------

  async updateBounty(bountyId: string, data: {
    title?: string;
    description?: string;
    category?: string;
    xpReward?: number;
    type?: string;
    status?: string;
    maxSubmissions?: number | null;
    startsAt?: string | null;
    endsAt?: string | null;
    proofRequirements?: string | null;
  }, userId: string) {
    const existing = await db.bounty.findUnique({ where: { id: bountyId } });
    if (!existing) throw new AppError('NOT_FOUND', 'Bounty not found');

    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.xpReward !== undefined) updateData.xpReward = data.xpReward;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.maxSubmissions !== undefined) updateData.maxSubmissions = data.maxSubmissions;
    if (data.startsAt !== undefined) updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
    if (data.endsAt !== undefined) updateData.endsAt = data.endsAt ? new Date(data.endsAt) : null;
    if (data.proofRequirements !== undefined) updateData.proofRequirements = data.proofRequirements;

    const bounty = await db.bounty.update({
      where: { id: bountyId },
      data: updateData,
    });

    await auditService.log({
      userId,
      module: 'bounty',
      action: 'bounty.updated',
      entityType: 'bounty',
      entityId: bounty.id,
      entityName: bounty.title,
    });

    return bounty;
  }

  // ----------------------------------------------------------
  // Admin: Delete (archive) bounty
  // ----------------------------------------------------------

  async deleteBounty(bountyId: string, userId: string) {
    const existing = await db.bounty.findUnique({ where: { id: bountyId } });
    if (!existing) throw new AppError('NOT_FOUND', 'Bounty not found');

    await db.bounty.update({
      where: { id: bountyId },
      data: { status: 'archived' },
    });

    await auditService.log({
      userId,
      module: 'bounty',
      action: 'bounty.archived',
      entityType: 'bounty',
      entityId: bountyId,
      entityName: existing.title,
    });

    return { message: 'Bounty archived' };
  }

  // ----------------------------------------------------------
  // Admin: List submissions for review
  // ----------------------------------------------------------

  async listSubmissions(filters: {
    page: number;
    limit: number;
    bountyId?: string;
    regionId?: string;
    status?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (filters.bountyId) where.bountyId = filters.bountyId;
    if (filters.status) where.status = filters.status;
    if (filters.regionId) {
      where.bounty = { regionId: filters.regionId };
    }

    const [submissions, total] = await Promise.all([
      db.bountySubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          bounty: { select: { id: true, title: true, xpReward: true, category: true, regionId: true } },
          user: { select: { id: true, displayName: true, username: true, avatarUrl: true } },
        },
      }),
      db.bountySubmission.count({ where }),
    ]);

    return {
      submissions: submissions.map((s) => ({
        id: s.id,
        bountyId: s.bounty.id,
        bountyTitle: s.bounty.title,
        bountyXpReward: s.bounty.xpReward,
        category: s.bounty.category,
        regionId: s.bounty.regionId,
        user: s.user,
        status: s.status,
        proofUrl: s.proofUrl,
        proofText: s.proofText,
        rejectNote: s.rejectNote,
        xpAwarded: s.xpAwarded,
        submittedAt: s.createdAt,
        reviewedAt: s.reviewedAt,
      })),
      total,
    };
  }

  // ----------------------------------------------------------
  // Admin: Approve submission
  // ----------------------------------------------------------

  async approveSubmission(submissionId: string, reviewerId: string) {
    const submission = await db.bountySubmission.findUnique({
      where: { id: submissionId },
      include: { bounty: true },
    });
    if (!submission) throw new AppError('NOT_FOUND', 'Submission not found');
    if (submission.status !== 'pending') throw new AppError('CONFLICT', 'Submission already reviewed');

    const xpAmount = submission.bounty.xpReward;

    await db.$transaction(async (tx) => {
      await tx.bountySubmission.update({
        where: { id: submissionId },
        data: {
          status: 'approved',
          reviewedBy: reviewerId,
          reviewedAt: new Date(),
          xpAwarded: xpAmount,
        },
      });

      // Award XP
      await xpService.award(tx, {
        userId: submission.userId,
        amount: xpAmount,
        sourceType: XP.SOURCES.BOUNTY_BASE,
        sourceId: submission.bountyId,
        description: `Bounty completed: ${submission.bounty.title}`,
      });
    });

    await auditService.log({
      userId: reviewerId,
      module: 'bounty',
      action: 'bounty.submission_approved',
      entityType: 'bounty_submission',
      entityId: submissionId,
    });

    return { message: 'Submission approved', xpAwarded: xpAmount };
  }

  // ----------------------------------------------------------
  // Admin: Reject submission
  // ----------------------------------------------------------

  async rejectSubmission(submissionId: string, rejectNote: string, reviewerId: string) {
    const submission = await db.bountySubmission.findUnique({ where: { id: submissionId } });
    if (!submission) throw new AppError('NOT_FOUND', 'Submission not found');
    if (submission.status !== 'pending') throw new AppError('CONFLICT', 'Submission already reviewed');

    await db.bountySubmission.update({
      where: { id: submissionId },
      data: {
        status: 'rejected',
        reviewedBy: reviewerId,
        reviewedAt: new Date(),
        rejectNote,
      },
    });

    await auditService.log({
      userId: reviewerId,
      module: 'bounty',
      action: 'bounty.submission_rejected',
      entityType: 'bounty_submission',
      entityId: submissionId,
    });

    return { message: 'Submission rejected' };
  }

  // ----------------------------------------------------------
  // Admin: Manage reviewers
  // ----------------------------------------------------------

  async addReviewer(regionId: string, userId: string, canCreate: boolean, addedBy: string) {
    const existing = await db.bountyReviewer.findUnique({
      where: { regionId_userId: { regionId, userId } },
    });
    if (existing) throw new AppError('CONFLICT', 'User is already a reviewer for this region');

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('NOT_FOUND', 'User not found');

    const reviewer = await db.bountyReviewer.create({
      data: { regionId, userId, canCreate, addedBy },
    });

    await auditService.log({
      userId: addedBy,
      module: 'bounty',
      action: 'bounty.reviewer_added',
      entityType: 'bounty_reviewer',
      entityId: reviewer.id,
      entityName: user.displayName,
    });

    return reviewer;
  }

  async removeReviewer(reviewerId: string, removedBy: string) {
    const reviewer = await db.bountyReviewer.findUnique({ where: { id: reviewerId } });
    if (!reviewer) throw new AppError('NOT_FOUND', 'Reviewer not found');

    await db.bountyReviewer.delete({ where: { id: reviewerId } });

    await auditService.log({
      userId: removedBy,
      module: 'bounty',
      action: 'bounty.reviewer_removed',
      entityType: 'bounty_reviewer',
      entityId: reviewerId,
    });

    return { message: 'Reviewer removed' };
  }

  async listReviewers(regionId: string) {
    const reviewers = await db.bountyReviewer.findMany({
      where: { regionId },
      include: {
        user: { select: { id: true, displayName: true, username: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reviewers.map((r) => ({
      id: r.id,
      userId: r.userId,
      bountyId: r.bountyId,
      canCreate: r.canCreate,
      user: r.user,
      createdAt: r.createdAt,
    }));
  }

  // ----------------------------------------------------------
  // Leaderboard
  // ----------------------------------------------------------

  async getPublicLeaderboard(limit: number = 50) {
    const users = await db.user.findMany({
      where: { isActive: true, totalXp: { gt: 0 } },
      orderBy: { totalXp: 'desc' },
      take: limit,
      select: {
        id: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        totalXp: true,
        level: true,
      },
    });

    return users.map((u, i) => ({ rank: i + 1, ...u }));
  }

  async getMemberLeaderboard(limit: number = 50) {
    const users = await db.user.findMany({
      where: {
        isActive: true,
        totalXp: { gt: 0 },
        regionMemberships: { some: { status: 'accepted', isActive: true } },
      },
      orderBy: { totalXp: 'desc' },
      take: limit,
      select: {
        id: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        totalXp: true,
        level: true,
      },
    });

    return users.map((u, i) => ({ rank: i + 1, ...u }));
  }

  async getRegionLeaderboard(regionId: string, limit: number = 50) {
    const memberships = await db.userRegionMembership.findMany({
      where: { regionId, status: 'accepted', isActive: true },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
            totalXp: true,
            level: true,
            isActive: true,
          },
        },
      },
    });

    const users = memberships
      .filter((m) => m.user.isActive && m.user.totalXp > 0)
      .sort((a, b) => b.user.totalXp - a.user.totalXp)
      .slice(0, limit)
      .map((m, i) => ({
        rank: i + 1,
        id: m.user.id,
        displayName: m.user.displayName,
        username: m.user.username,
        avatarUrl: m.user.avatarUrl,
        totalXp: m.user.totalXp,
        level: m.user.level,
      }));

    return users;
  }
}

export const bountyService = new BountyService();
