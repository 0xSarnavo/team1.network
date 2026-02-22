import db from '@/lib/db/client';
import { AppError } from '@/lib/helpers/errors';
import { auditService } from './audit.service';
import { xpService } from './xp.service';

// ============================================================
// Portal Service
// ============================================================

class PortalService {
  // ----------------------------------------------------------
  // Hub Data (Public Landing)
  // ----------------------------------------------------------

  async getHubData() {
    const [regions, upcomingEventsCount, activeQuestsCount, guidesCount, programsCount] = await Promise.all([
      db.region.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          country: true,
          city: true,
          logoUrl: true,
          coverImageUrl: true,
          _count: { select: { memberships: { where: { status: 'accepted', isActive: true } } } },
        },
      }),
      db.portalEvent.count({
        where: { status: 'published', startDate: { gte: new Date() } },
      }),
      db.portalQuest.count({
        where: { isActive: true },
      }),
      db.portalGuide.count({
        where: { status: 'published' },
      }),
      db.portalProgram.count({
        where: { status: 'active' },
      }),
    ]);

    return {
      regions: regions.map(r => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        country: r.country,
        city: r.city,
        logoUrl: r.logoUrl,
        coverImageUrl: r.coverImageUrl,
        memberCount: r._count.memberships,
      })),
      counts: {
        upcomingEvents: upcomingEventsCount,
        activeQuests: activeQuestsCount,
        publishedGuides: guidesCount,
        activePrograms: programsCount,
      },
    };
  }

  // ----------------------------------------------------------
  // Region Detail
  // ----------------------------------------------------------

  async getRegionBySlug(slug: string) {
    const region = await db.region.findUnique({
      where: { slug },
      include: {
        _count: { select: { memberships: { where: { status: 'accepted', isActive: true } } } },
      },
    });

    if (!region || !region.isActive) {
      throw new AppError('NOT_FOUND', 'Region not found');
    }

    // Get recent events for this region
    const events = await db.portalEvent.findMany({
      where: { regionId: region.id, status: 'published' },
      orderBy: { startDate: 'desc' },
      take: 6,
      include: { _count: { select: { rsvps: true } } },
    });

    // Get members (accepted)
    const members = await db.userRegionMembership.findMany({
      where: { regionId: region.id, status: 'accepted', isActive: true },
      orderBy: { acceptedAt: 'desc' },
      take: 20,
      include: {
        user: {
          select: {
            id: true, username: true, displayName: true, avatarUrl: true,
            title: true, level: true,
          },
        },
      },
    });

    // Get leads
    const leads = await db.userRegionMembership.findMany({
      where: {
        regionId: region.id,
        status: 'accepted',
        isActive: true,
        role: { in: ['lead', 'co_lead'] },
      },
      include: {
        user: {
          select: {
            id: true, username: true, displayName: true, avatarUrl: true, title: true,
          },
        },
      },
    });

    return {
      id: region.id,
      name: region.name,
      slug: region.slug,
      description: region.description,
      country: region.country,
      city: region.city,
      logoUrl: region.logoUrl,
      coverImageUrl: region.coverImageUrl,
      memberCount: region._count.memberships,
      leads: leads.map(l => ({
        ...l.user,
        role: l.role,
      })),
      members: members.map(m => ({
        ...m.user,
        role: m.role,
        joinedAt: m.acceptedAt,
      })),
      events: events.map(e => ({
        id: e.id, title: e.title, slug: e.slug, type: e.type,
        startDate: e.startDate, endDate: e.endDate, location: e.location,
        isVirtual: e.isVirtual, rsvpCount: e._count.rsvps,
      })),
    };
  }

  // ----------------------------------------------------------
  // Region Admin (for leads)
  // ----------------------------------------------------------

  async getRegionAdminData(regionSlug: string, userId: string) {
    const region = await db.region.findUnique({ where: { slug: regionSlug } });
    if (!region) throw new AppError('NOT_FOUND', 'Region not found');

    // Verify user is a lead of this region
    const membership = await db.userRegionMembership.findUnique({
      where: { userId_regionId: { userId, regionId: region.id } },
    });
    if (!membership || !['lead', 'co_lead'].includes(membership.role)) {
      throw new AppError('FORBIDDEN', 'Only region leads can access this');
    }

    const [totalMembers, pendingMembers, totalEvents, recentMembers] = await Promise.all([
      db.userRegionMembership.count({ where: { regionId: region.id, status: 'accepted', isActive: true } }),
      db.userRegionMembership.count({ where: { regionId: region.id, status: 'pending' } }),
      db.portalEvent.count({ where: { regionId: region.id } }),
      db.userRegionMembership.findMany({
        where: { regionId: region.id },
        orderBy: { appliedAt: 'desc' },
        take: 50,
        include: {
          user: {
            select: {
              id: true, email: true, username: true, displayName: true,
              avatarUrl: true, level: true,
            },
          },
        },
      }),
    ]);

    return {
      region: { id: region.id, name: region.name, slug: region.slug },
      stats: { totalMembers, pendingMembers, totalEvents },
      members: recentMembers.map(m => ({
        membershipId: m.id,
        user: m.user,
        role: m.role,
        status: m.status,
        isPrimary: m.isPrimary,
        appliedAt: m.appliedAt,
        acceptedAt: m.acceptedAt,
        isActive: m.isActive,
      })),
    };
  }

  async regionLeadAddMember(regionSlug: string, leadUserId: string, data: { email: string; role?: string }) {
    const region = await db.region.findUnique({ where: { slug: regionSlug } });
    if (!region) throw new AppError('NOT_FOUND', 'Region not found');

    // Verify requester is lead
    const leadMembership = await db.userRegionMembership.findUnique({
      where: { userId_regionId: { userId: leadUserId, regionId: region.id } },
    });
    if (!leadMembership || !['lead', 'co_lead'].includes(leadMembership.role)) {
      throw new AppError('FORBIDDEN', 'Only region leads can add members');
    }

    // Find user by email
    const user = await db.user.findUnique({ where: { email: data.email } });
    if (!user) throw new AppError('NOT_FOUND', 'User not found with this email');

    // Check existing membership
    const existing = await db.userRegionMembership.findUnique({
      where: { userId_regionId: { userId: user.id, regionId: region.id } },
    });
    if (existing) {
      if (existing.status === 'accepted' && existing.isActive) {
        throw new AppError('CONFLICT', 'User is already a member of this region');
      }
      // Re-activate or accept
      await db.userRegionMembership.update({
        where: { id: existing.id },
        data: { status: 'accepted', isActive: true, role: data.role || 'member', acceptedAt: new Date() },
      });
    } else {
      await db.userRegionMembership.create({
        data: {
          userId: user.id,
          regionId: region.id,
          role: data.role || 'member',
          status: 'accepted',
          acceptedAt: new Date(),
        },
      });
    }

    await auditService.log({
      userId: leadUserId,
      module: 'portal',
      action: 'portal.region.member_added',
      entityType: 'membership',
      entityId: user.id,
      details: { regionSlug, email: data.email, role: data.role || 'member' },
    });

    return { message: 'Member added successfully' };
  }

  // ----------------------------------------------------------
  // Member Dashboard
  // ----------------------------------------------------------

  async getMemberDashboard(userId: string) {
    const [
      memberships,
      questProgress,
      upcomingRsvps,
      user,
    ] = await Promise.all([
      db.userRegionMembership.findMany({
        where: { userId, status: 'accepted', isActive: true },
        include: { region: { select: { id: true, name: true, slug: true, logoUrl: true } } },
      }),
      db.questSubmission.findMany({
        where: { userId },
        include: { quest: { select: { id: true, title: true, xpReward: true, difficulty: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      db.eventRsvp.findMany({
        where: { userId, event: { startDate: { gte: new Date() } } },
        include: {
          event: {
            select: {
              id: true, title: true, startDate: true, endDate: true,
              location: true, isVirtual: true, type: true,
            },
          },
        },
        orderBy: { event: { startDate: 'asc' } },
        take: 5,
      }),
      db.user.findUnique({
        where: { id: userId },
        select: { totalXp: true, level: true, displayName: true },
      }),
    ]);

    return {
      user: { totalXp: user?.totalXp || 0, level: user?.level || 1, displayName: user?.displayName || '' },
      regions: memberships.map(m => ({
        ...m.region,
        role: m.role,
        isPrimary: m.isPrimary,
      })),
      questProgress: questProgress.map(s => ({
        submissionId: s.id,
        quest: s.quest,
        status: s.status,
        submittedAt: s.createdAt,
      })),
      upcomingEvents: upcomingRsvps.map(r => r.event),
    };
  }

  // ----------------------------------------------------------
  // Events: Public
  // ----------------------------------------------------------

  async listEvents(filters: {
    page: number;
    limit: number;
    regionId?: string;
    type?: string;
    status?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (filters.regionId) where.regionId = filters.regionId;
    if (filters.type) where.type = filters.type;
    if (filters.status) {
      where.status = filters.status;
    } else {
      where.status = { not: 'draft' };
    }

    const [events, total] = await Promise.all([
      db.portalEvent.findMany({
        where,
        orderBy: { startDate: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          _count: { select: { rsvps: true } },
        },
      }),
      db.portalEvent.count({ where }),
    ]);

    return {
      events: events.map(e => ({
        id: e.id,
        title: e.title,
        slug: e.slug,
        description: e.description,
        type: e.type,
        status: e.status,
        regionId: e.regionId,
        coverImageUrl: e.coverImageUrl,
        location: e.location,
        locationUrl: e.locationUrl,
        isVirtual: e.isVirtual,
        virtualUrl: e.virtualUrl,
        startDate: e.startDate,
        endDate: e.endDate,
        timezone: e.timezone,
        capacity: e.capacity,
        speakers: e.speakers,
        rsvpCount: e._count.rsvps,
        createdAt: e.createdAt,
      })),
      total,
    };
  }

  async getEventById(eventId: string, userId?: string) {
    const event = await db.portalEvent.findUnique({
      where: { id: eventId },
      include: {
        rsvps: userId
          ? { where: { userId }, select: { id: true, createdAt: true } }
          : false,
        _count: { select: { rsvps: true } },
      },
    });

    if (!event) throw new AppError('NOT_FOUND', 'Event not found');

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      type: event.type,
      status: event.status,
      regionId: event.regionId,
      coverImageUrl: event.coverImageUrl,
      location: event.location,
      locationUrl: event.locationUrl,
      isVirtual: event.isVirtual,
      virtualUrl: event.virtualUrl,
      startDate: event.startDate,
      endDate: event.endDate,
      timezone: event.timezone,
      capacity: event.capacity,
      speakers: event.speakers,
      organizedBy: event.organizedBy,
      rsvpCount: event._count.rsvps,
      hasRsvped: userId && Array.isArray(event.rsvps) ? event.rsvps.length > 0 : false,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  async rsvpEvent(eventId: string, userId: string) {
    const event = await db.portalEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('NOT_FOUND', 'Event not found');
    if (event.status !== 'published') throw new AppError('VALIDATION_ERROR', 'Event is not open for RSVP');

    if (event.capacity) {
      const count = await db.eventRsvp.count({ where: { eventId } });
      if (count >= event.capacity) throw new AppError('VALIDATION_ERROR', 'Event is at full capacity');
    }

    const existing = await db.eventRsvp.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (existing) throw new AppError('CONFLICT', 'Already RSVPed to this event');

    const rsvp = await db.eventRsvp.create({
      data: { eventId, userId },
    });

    return { message: 'RSVP confirmed', rsvpId: rsvp.id };
  }

  async unRsvpEvent(eventId: string, userId: string) {
    const rsvp = await db.eventRsvp.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
    if (!rsvp) throw new AppError('NOT_FOUND', 'RSVP not found');

    await db.eventRsvp.delete({
      where: { id: rsvp.id },
    });

    return { message: 'RSVP cancelled' };
  }

  // ----------------------------------------------------------
  // Quests: Public (Auth Required)
  // ----------------------------------------------------------

  async listQuests(filters: { category?: string }) {
    const where: Record<string, unknown> = { isActive: true };
    if (filters.category) where.category = filters.category;

    const quests = await db.portalQuest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { submissions: true } },
      },
    });

    return quests.map(q => ({
      id: q.id,
      title: q.title,
      description: q.description,
      category: q.category,
      type: q.type,
      xpReward: q.xpReward,
      difficulty: q.difficulty,
      requirements: q.requirements,
      proofType: q.proofType,
      membersOnly: q.membersOnly,
      startsAt: q.startsAt,
      endsAt: q.endsAt,
      submissionCount: q._count.submissions,
      createdAt: q.createdAt,
    }));
  }

  async getQuestById(questId: string, userId?: string) {
    const quest = await db.portalQuest.findUnique({
      where: { id: questId },
      include: {
        submissions: userId
          ? { where: { userId }, select: { id: true, status: true, createdAt: true } }
          : false,
        _count: { select: { submissions: true } },
      },
    });

    if (!quest) throw new AppError('NOT_FOUND', 'Quest not found');

    return {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      category: quest.category,
      type: quest.type,
      xpReward: quest.xpReward,
      difficulty: quest.difficulty,
      requirements: quest.requirements,
      proofType: quest.proofType,
      membersOnly: quest.membersOnly,
      startsAt: quest.startsAt,
      endsAt: quest.endsAt,
      submissionCount: quest._count.submissions,
      mySubmission: userId && Array.isArray(quest.submissions) && quest.submissions.length > 0
        ? quest.submissions[0]
        : null,
      createdAt: quest.createdAt,
      updatedAt: quest.updatedAt,
    };
  }

  async submitQuestProof(questId: string, userId: string, data: {
    proofUrl?: string;
    proofText?: string;
  }) {
    const quest = await db.portalQuest.findUnique({ where: { id: questId } });
    if (!quest) throw new AppError('NOT_FOUND', 'Quest not found');
    if (!quest.isActive) throw new AppError('VALIDATION_ERROR', 'Quest is not active');

    if (quest.endsAt && new Date() > quest.endsAt) {
      throw new AppError('VALIDATION_ERROR', 'Quest submission period has ended');
    }

    const existing = await db.questSubmission.findUnique({
      where: { questId_userId: { questId, userId } },
    });
    if (existing) throw new AppError('CONFLICT', 'Already submitted proof for this quest');

    if (quest.membersOnly) {
      const membership = await db.userRegionMembership.findFirst({
        where: { userId, status: 'accepted', isActive: true },
      });
      if (!membership) throw new AppError('FORBIDDEN', 'This quest is for members only');
    }

    const submission = await db.questSubmission.create({
      data: {
        questId,
        userId,
        proofUrl: data.proofUrl,
        proofText: data.proofText,
      },
    });

    return { message: 'Proof submitted', submissionId: submission.id };
  }

  async getMyQuestProgress(userId: string) {
    const submissions = await db.questSubmission.findMany({
      where: { userId },
      include: {
        quest: {
          select: {
            id: true,
            title: true,
            category: true,
            xpReward: true,
            difficulty: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return submissions.map(s => ({
      submissionId: s.id,
      questId: s.quest.id,
      questTitle: s.quest.title,
      category: s.quest.category,
      xpReward: s.quest.xpReward,
      difficulty: s.quest.difficulty,
      status: s.status,
      proofUrl: s.proofUrl,
      proofText: s.proofText,
      rejectNote: s.rejectNote,
      submittedAt: s.createdAt,
      reviewedAt: s.reviewedAt,
    }));
  }

  // ----------------------------------------------------------
  // Guides: Public
  // ----------------------------------------------------------

  async listGuides(filters: {
    page: number;
    limit: number;
    category?: string;
    search?: string;
  }) {
    const where: Record<string, unknown> = { status: 'published' };
    if (filters.category) where.category = filters.category;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [guides, total] = await Promise.all([
      db.portalGuide.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          coverImageUrl: true,
          readTime: true,
          authorId: true,
          createdAt: true,
        },
      }),
      db.portalGuide.count({ where }),
    ]);

    return { guides, total };
  }

  async getGuideBySlug(slug: string) {
    const guide = await db.portalGuide.findUnique({
      where: { slug },
    });

    if (!guide || guide.status !== 'published') {
      throw new AppError('NOT_FOUND', 'Guide not found');
    }

    return guide;
  }

  // ----------------------------------------------------------
  // Programs: Public
  // ----------------------------------------------------------

  async listPrograms() {
    const programs = await db.portalProgram.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' },
    });

    return programs.map(p => ({
      id: p.id,
      title: p.title,
      description: p.description,
      eligibility: p.eligibility,
      benefits: p.benefits,
      status: p.status,
      startsAt: p.startsAt,
      endsAt: p.endsAt,
      createdAt: p.createdAt,
    }));
  }

  async getProgramById(programId: string) {
    const program = await db.portalProgram.findUnique({ where: { id: programId } });
    if (!program) throw new AppError('NOT_FOUND', 'Program not found');
    return program;
  }

  // ----------------------------------------------------------
  // Members: Directory (Auth Required)
  // ----------------------------------------------------------

  async searchMembers(filters: {
    page: number;
    limit: number;
    regionId?: string;
    skill?: string;
    availability?: string;
    search?: string;
  }) {
    const where: Record<string, unknown> = {
      isActive: true,
      regionMemberships: {
        some: { status: 'accepted', isActive: true },
      },
    };

    if (filters.regionId) {
      where.regionMemberships = {
        some: { regionId: filters.regionId, status: 'accepted', isActive: true },
      };
    }

    if (filters.availability) where.availability = filters.availability;

    if (filters.search) {
      where.OR = [
        { displayName: { contains: filters.search, mode: 'insensitive' } },
        { username: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.skill) {
      where.skills = {
        some: { skill: { name: { contains: filters.skill, mode: 'insensitive' } } },
      };
    }

    const [members, total] = await Promise.all([
      db.user.findMany({
        where,
        orderBy: { displayName: 'asc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          bio: true,
          title: true,
          level: true,
          availability: true,
          country: true,
          city: true,
          skills: { include: { skill: true }, take: 5 },
          regionMemberships: {
            where: { status: 'accepted', isActive: true },
            include: { region: { select: { id: true, name: true, slug: true } } },
          },
        },
      }),
      db.user.count({ where }),
    ]);

    return {
      members: members.map(m => ({
        id: m.id,
        username: m.username,
        displayName: m.displayName,
        avatarUrl: m.avatarUrl,
        bio: m.bio,
        title: m.title,
        level: m.level,
        availability: m.availability,
        country: m.country,
        city: m.city,
        skills: m.skills.map(us => ({ id: us.skill.id, name: us.skill.name })),
        regions: m.regionMemberships.map(rm => ({
          id: rm.region.id, name: rm.region.name, slug: rm.region.slug, role: rm.role,
        })),
      })),
      total,
    };
  }

  // ----------------------------------------------------------
  // Membership
  // ----------------------------------------------------------

  async getMembershipInfo() {
    const regions = await db.region.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        country: true,
        city: true,
      },
    });

    return { regions };
  }

  async applyForMembership(userId: string, data: { regionId: string; isPrimary?: boolean }) {
    const region = await db.region.findUnique({ where: { id: data.regionId } });
    if (!region || !region.isActive) throw new AppError('NOT_FOUND', 'Region not found');

    const existing = await db.userRegionMembership.findUnique({
      where: { userId_regionId: { userId, regionId: data.regionId } },
    });
    if (existing) throw new AppError('CONFLICT', 'Already applied to this region');

    const membership = await db.userRegionMembership.create({
      data: {
        userId,
        regionId: data.regionId,
        isPrimary: data.isPrimary ?? false,
        status: 'pending',
      },
    });

    return { message: 'Application submitted', membershipId: membership.id };
  }

  async getMyMembershipStatus(userId: string) {
    const memberships = await db.userRegionMembership.findMany({
      where: { userId },
      include: {
        region: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    return memberships.map(m => ({
      id: m.id,
      regionId: m.regionId,
      regionName: m.region.name,
      regionSlug: m.region.slug,
      regionLogoUrl: m.region.logoUrl,
      role: m.role,
      status: m.status,
      isPrimary: m.isPrimary,
      appliedAt: m.appliedAt,
      acceptedAt: m.acceptedAt,
      isActive: m.isActive,
    }));
  }

  async verifyMembership(userId: string) {
    const membership = await db.userRegionMembership.findFirst({
      where: { userId, status: 'accepted', isActive: true },
    });

    return { isMember: !!membership };
  }

  // ----------------------------------------------------------
  // Host Applications
  // ----------------------------------------------------------

  async createHostApplication(userId: string, data: {
    title: string;
    description: string;
    eventType: string;
    location?: string;
    proposedDate?: string;
    capacity?: number;
  }) {
    const application = await db.hostApplication.create({
      data: {
        userId,
        title: data.title,
        description: data.description,
        eventType: data.eventType,
        location: data.location,
        proposedDate: data.proposedDate ? new Date(data.proposedDate) : undefined,
        capacity: data.capacity,
      },
    });

    return { message: 'Host application submitted', applicationId: application.id };
  }

  // ----------------------------------------------------------
  // Admin: Regions CRUD
  // ----------------------------------------------------------

  async adminListRegions() {
    const regions = await db.region.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { memberships: true } },
      },
    });

    return regions.map(r => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      country: r.country,
      city: r.city,
      logoUrl: r.logoUrl,
      coverImageUrl: r.coverImageUrl,
      isActive: r.isActive,
      sortOrder: r.sortOrder,
      memberCount: r._count.memberships,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async adminCreateRegion(data: {
    name: string;
    slug: string;
    description?: string;
    country?: string;
    city?: string;
    logoUrl?: string;
    coverImageUrl?: string;
    sortOrder?: number;
  }, userId: string) {
    const existing = await db.region.findUnique({ where: { slug: data.slug } });
    if (existing) throw new AppError('CONFLICT', 'Region slug already exists');

    const region = await db.region.create({ data });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.region.created',
      entityType: 'region',
      entityId: region.id,
      entityName: region.name,
    });

    return region;
  }

  // ----------------------------------------------------------
  // Admin: Members Management
  // ----------------------------------------------------------

  async adminListMembers(filters: {
    page: number;
    limit: number;
    regionId?: string;
    status?: string;
    search?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (filters.regionId) where.regionId = filters.regionId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.user = {
        OR: [
          { displayName: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } },
          { username: { contains: filters.search, mode: 'insensitive' } },
        ],
      };
    }

    const [memberships, total] = await Promise.all([
      db.userRegionMembership.findMany({
        where,
        orderBy: { appliedAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              level: true,
            },
          },
          region: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      db.userRegionMembership.count({ where }),
    ]);

    return {
      memberships: memberships.map(m => ({
        id: m.id,
        user: m.user,
        region: m.region,
        role: m.role,
        status: m.status,
        isPrimary: m.isPrimary,
        isActive: m.isActive,
        appliedAt: m.appliedAt,
        acceptedAt: m.acceptedAt,
      })),
      total,
    };
  }

  async adminAcceptMember(memberId: string, userId: string) {
    const membership = await db.userRegionMembership.findUnique({ where: { id: memberId } });
    if (!membership) throw new AppError('NOT_FOUND', 'Membership not found');
    if (membership.status === 'accepted') throw new AppError('CONFLICT', 'Already accepted');

    await db.userRegionMembership.update({
      where: { id: memberId },
      data: { status: 'accepted', acceptedAt: new Date() },
    });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.member.accepted',
      entityType: 'membership',
      entityId: memberId,
    });

    return { message: 'Member accepted' };
  }

  async adminRejectMember(memberId: string, userId: string) {
    const membership = await db.userRegionMembership.findUnique({ where: { id: memberId } });
    if (!membership) throw new AppError('NOT_FOUND', 'Membership not found');

    await db.userRegionMembership.update({
      where: { id: memberId },
      data: { status: 'rejected' },
    });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.member.rejected',
      entityType: 'membership',
      entityId: memberId,
    });

    return { message: 'Member rejected' };
  }

  async adminChangeMemberRole(memberId: string, role: string, userId: string) {
    const membership = await db.userRegionMembership.findUnique({ where: { id: memberId } });
    if (!membership) throw new AppError('NOT_FOUND', 'Membership not found');

    await db.userRegionMembership.update({
      where: { id: memberId },
      data: { role },
    });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.member.role_changed',
      entityType: 'membership',
      entityId: memberId,
      details: { role },
    });

    return { message: 'Role updated' };
  }

  async adminRemoveMember(memberId: string, userId: string) {
    const membership = await db.userRegionMembership.findUnique({ where: { id: memberId } });
    if (!membership) throw new AppError('NOT_FOUND', 'Membership not found');

    await db.userRegionMembership.update({
      where: { id: memberId },
      data: { isActive: false },
    });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.member.removed',
      entityType: 'membership',
      entityId: memberId,
    });

    return { message: 'Member removed' };
  }

  // ----------------------------------------------------------
  // Admin: Events CRUD
  // ----------------------------------------------------------

  async adminListEvents(filters: {
    page: number;
    limit: number;
    status?: string;
    regionId?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.regionId) where.regionId = filters.regionId;

    const [events, total] = await Promise.all([
      db.portalEvent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          _count: { select: { rsvps: true } },
        },
      }),
      db.portalEvent.count({ where }),
    ]);

    return {
      events: events.map(e => ({
        ...e,
        rsvpCount: e._count.rsvps,
        _count: undefined,
      })),
      total,
    };
  }

  async adminCreateEvent(data: {
    title: string;
    slug: string;
    description: string;
    type: string;
    status?: string;
    regionId?: string;
    coverImageUrl?: string;
    location?: string;
    locationUrl?: string;
    isVirtual?: boolean;
    virtualUrl?: string;
    startDate: string;
    endDate?: string;
    timezone?: string;
    capacity?: number;
    speakers?: unknown;
    organizedBy?: string;
  }, userId: string) {
    const existing = await db.portalEvent.findUnique({ where: { slug: data.slug } });
    if (existing) throw new AppError('CONFLICT', 'Event slug already exists');

    const event = await db.portalEvent.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        type: data.type as any,
        status: (data.status as any) || 'draft',
        regionId: data.regionId,
        coverImageUrl: data.coverImageUrl,
        location: data.location,
        locationUrl: data.locationUrl,
        isVirtual: data.isVirtual ?? false,
        virtualUrl: data.virtualUrl,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        timezone: data.timezone || 'UTC',
        capacity: data.capacity,
        speakers: data.speakers as any,
        organizedBy: data.organizedBy,
        createdBy: userId,
      },
    });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.event.created',
      entityType: 'event',
      entityId: event.id,
      entityName: event.title,
    });

    return event;
  }

  async adminGetEvent(eventId: string) {
    const event = await db.portalEvent.findUnique({
      where: { id: eventId },
      include: {
        rsvps: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: { select: { rsvps: true } },
      },
    });

    if (!event) throw new AppError('NOT_FOUND', 'Event not found');

    return { ...event, rsvpCount: event._count.rsvps };
  }

  async adminUpdateEvent(eventId: string, data: Record<string, unknown>, userId: string) {
    const event = await db.portalEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('NOT_FOUND', 'Event not found');

    // Convert date strings to Date objects if present
    if (typeof data.startDate === 'string') data.startDate = new Date(data.startDate);
    if (typeof data.endDate === 'string') data.endDate = new Date(data.endDate);

    const updated = await db.portalEvent.update({
      where: { id: eventId },
      data: data as any,
    });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.event.updated',
      entityType: 'event',
      entityId: eventId,
      entityName: updated.title,
      details: { fields: Object.keys(data) },
    });

    return updated;
  }

  async adminDeleteEvent(eventId: string, userId: string) {
    const event = await db.portalEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new AppError('NOT_FOUND', 'Event not found');

    await db.portalEvent.delete({ where: { id: eventId } });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.event.deleted',
      entityType: 'event',
      entityId: eventId,
      entityName: event.title,
    });

    return { message: 'Event deleted' };
  }

  // ----------------------------------------------------------
  // Admin: Quests CRUD
  // ----------------------------------------------------------

  async adminListQuests(filters: {
    page: number;
    limit: number;
    category?: string;
    isActive?: boolean;
  }) {
    const where: Record<string, unknown> = {};
    if (filters.category) where.category = filters.category;
    if (filters.isActive !== undefined) where.isActive = filters.isActive;

    const [quests, total] = await Promise.all([
      db.portalQuest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          _count: { select: { submissions: true } },
        },
      }),
      db.portalQuest.count({ where }),
    ]);

    return {
      quests: quests.map(q => ({
        ...q,
        submissionCount: q._count.submissions,
        _count: undefined,
      })),
      total,
    };
  }

  async adminCreateQuest(data: {
    title: string;
    description: string;
    category: string;
    type?: string;
    xpReward: number;
    difficulty?: string;
    requirements?: unknown;
    proofType?: string;
    membersOnly?: boolean;
    startsAt?: string;
    endsAt?: string;
  }, userId: string) {
    const quest = await db.portalQuest.create({
      data: {
        title: data.title,
        description: data.description,
        category: data.category as any,
        type: (data.type as any) || 'single_action',
        xpReward: data.xpReward,
        difficulty: data.difficulty || 'easy',
        requirements: data.requirements as any,
        proofType: data.proofType || 'url',
        membersOnly: data.membersOnly ?? false,
        startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
        endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
        createdBy: userId,
      },
    });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.quest.created',
      entityType: 'quest',
      entityId: quest.id,
      entityName: quest.title,
    });

    return quest;
  }

  async adminGetQuest(questId: string) {
    const quest = await db.portalQuest.findUnique({
      where: { id: questId },
      include: {
        submissions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: { select: { submissions: true } },
      },
    });

    if (!quest) throw new AppError('NOT_FOUND', 'Quest not found');

    return { ...quest, submissionCount: quest._count.submissions };
  }

  async adminUpdateQuest(questId: string, data: Record<string, unknown>, userId: string) {
    const quest = await db.portalQuest.findUnique({ where: { id: questId } });
    if (!quest) throw new AppError('NOT_FOUND', 'Quest not found');

    if (typeof data.startsAt === 'string') data.startsAt = new Date(data.startsAt);
    if (typeof data.endsAt === 'string') data.endsAt = new Date(data.endsAt);

    const updated = await db.portalQuest.update({
      where: { id: questId },
      data: data as any,
    });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.quest.updated',
      entityType: 'quest',
      entityId: questId,
      entityName: updated.title,
      details: { fields: Object.keys(data) },
    });

    return updated;
  }

  // ----------------------------------------------------------
  // Admin: Quest Submission Review
  // ----------------------------------------------------------

  async adminApproveSubmission(submissionId: string, userId: string) {
    const submission = await db.questSubmission.findUnique({
      where: { id: submissionId },
      include: { quest: true },
    });
    if (!submission) throw new AppError('NOT_FOUND', 'Submission not found');
    if (submission.status !== 'pending') throw new AppError('CONFLICT', 'Submission already reviewed');

    await db.$transaction(async (tx) => {
      await tx.questSubmission.update({
        where: { id: submissionId },
        data: {
          status: 'approved',
          reviewedBy: userId,
          reviewedAt: new Date(),
        },
      });

      // Award XP
      await xpService.award(tx, {
        userId: submission.userId,
        amount: submission.quest.xpReward,
        sourceType: 'quest_complete',
        sourceId: submission.questId,
        description: `Quest completed: ${submission.quest.title}`,
      });
    });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.quest.submission_approved',
      entityType: 'submission',
      entityId: submissionId,
    });

    return { message: 'Submission approved', xpAwarded: submission.quest.xpReward };
  }

  async adminRejectSubmission(submissionId: string, rejectNote: string, userId: string) {
    const submission = await db.questSubmission.findUnique({ where: { id: submissionId } });
    if (!submission) throw new AppError('NOT_FOUND', 'Submission not found');
    if (submission.status !== 'pending') throw new AppError('CONFLICT', 'Submission already reviewed');

    await db.questSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'rejected',
        reviewedBy: userId,
        reviewedAt: new Date(),
        rejectNote,
      },
    });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.quest.submission_rejected',
      entityType: 'submission',
      entityId: submissionId,
    });

    return { message: 'Submission rejected' };
  }

  // ----------------------------------------------------------
  // Admin: Guides CRUD
  // ----------------------------------------------------------

  async adminListGuides(filters: {
    page: number;
    limit: number;
    status?: string;
    category?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;

    const [guides, total] = await Promise.all([
      db.portalGuide.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      db.portalGuide.count({ where }),
    ]);

    return { guides, total };
  }

  async adminCreateGuide(data: {
    title: string;
    slug: string;
    category: string;
    content: string;
    coverImageUrl?: string;
    readTime?: number;
    status?: string;
  }, userId: string) {
    const existing = await db.portalGuide.findUnique({ where: { slug: data.slug } });
    if (existing) throw new AppError('CONFLICT', 'Guide slug already exists');

    const guide = await db.portalGuide.create({
      data: {
        title: data.title,
        slug: data.slug,
        category: data.category,
        content: data.content,
        coverImageUrl: data.coverImageUrl,
        readTime: data.readTime,
        status: data.status || 'draft',
        authorId: userId,
      },
    });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.guide.created',
      entityType: 'guide',
      entityId: guide.id,
      entityName: guide.title,
    });

    return guide;
  }

  async adminGetGuide(guideId: string) {
    const guide = await db.portalGuide.findUnique({ where: { id: guideId } });
    if (!guide) throw new AppError('NOT_FOUND', 'Guide not found');
    return guide;
  }

  async adminUpdateGuide(guideId: string, data: Record<string, unknown>, userId: string) {
    const guide = await db.portalGuide.findUnique({ where: { id: guideId } });
    if (!guide) throw new AppError('NOT_FOUND', 'Guide not found');

    const updated = await db.portalGuide.update({
      where: { id: guideId },
      data: data as any,
    });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.guide.updated',
      entityType: 'guide',
      entityId: guideId,
      entityName: updated.title,
      details: { fields: Object.keys(data) },
    });

    return updated;
  }

  async adminDeleteGuide(guideId: string, userId: string) {
    const guide = await db.portalGuide.findUnique({ where: { id: guideId } });
    if (!guide) throw new AppError('NOT_FOUND', 'Guide not found');

    await db.portalGuide.delete({ where: { id: guideId } });

    await auditService.log({
      userId,
      module: 'portal',
      action: 'portal.guide.deleted',
      entityType: 'guide',
      entityId: guideId,
      entityName: guide.title,
    });

    return { message: 'Guide deleted' };
  }

  // ----------------------------------------------------------
  // Admin: Analytics
  // ----------------------------------------------------------

  async getAdminStats() {
    const [
      totalRegions,
      totalMembers,
      pendingMembers,
      totalEvents,
      upcomingEvents,
      totalQuests,
      pendingSubmissions,
      totalGuides,
      totalPrograms,
      pendingHostApps,
    ] = await Promise.all([
      db.region.count({ where: { isActive: true } }),
      db.userRegionMembership.count({ where: { status: 'accepted', isActive: true } }),
      db.userRegionMembership.count({ where: { status: 'pending' } }),
      db.portalEvent.count(),
      db.portalEvent.count({ where: { status: 'published', startDate: { gte: new Date() } } }),
      db.portalQuest.count({ where: { isActive: true } }),
      db.questSubmission.count({ where: { status: 'pending' } }),
      db.portalGuide.count(),
      db.portalProgram.count(),
      db.hostApplication.count({ where: { status: 'pending' } }),
    ]);

    return {
      regions: { total: totalRegions },
      members: { total: totalMembers, pending: pendingMembers },
      events: { total: totalEvents, upcoming: upcomingEvents },
      quests: { total: totalQuests, pendingSubmissions },
      guides: { total: totalGuides },
      programs: { total: totalPrograms },
      hostApplications: { pending: pendingHostApps },
    };
  }
}

export const portalService = new PortalService();
