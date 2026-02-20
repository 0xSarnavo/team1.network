import db from '@/lib/db/client';
import { AppError } from '@/lib/helpers/errors';
import { auditService } from './audit.service';
import { xpService } from './xp.service';
import { cache } from '@/lib/helpers/cache';

// ============================================================
// Profile Service
// ============================================================

class ProfileService {
  // ----------------------------------------------------------
  // Public Profile
  // ----------------------------------------------------------

  async getPublicProfile(username: string, viewerId?: string) {
    const user = await db.user.findUnique({
      where: { username },
      include: {
        skills: { include: { skill: true } },
        interests: { include: { interest: true } },
        profileRoles: true,
        socialLinks: { orderBy: { sortOrder: 'asc' } },
        customLinks: { where: { isPublic: true }, orderBy: { sortOrder: 'asc' } },
        wallets: { where: { isPrimary: true }, select: { address: true, chain: true, label: true } },
        badges: {
          where: { isClaimed: true },
          include: { badge: true },
          orderBy: [{ isPinned: 'desc' }, { pinOrder: 'asc' }, { unlockedAt: 'desc' }],
        },
        regionMemberships: {
          where: { isActive: true, status: 'accepted' },
          include: { region: { select: { id: true, name: true, slug: true, logoUrl: true } } },
        },
        privacySettings: true,
      },
    });

    if (!user || !user.isActive) {
      throw new AppError('NOT_FOUND', 'User not found');
    }

    const isOwnProfile = viewerId === user.id;
    const privacyMap = this.buildPrivacyMap(user.privacySettings);

    return {
      // Always public
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      coverPhotoUrl: user.coverPhotoUrl,
      bio: user.bio,
      title: user.title,
      level: user.level,
      totalXp: isOwnProfile || privacyMap['show_xp'] !== false ? user.totalXp : null,
      availability: user.availability,
      country: isOwnProfile || privacyMap['show_location'] !== false ? user.country : null,
      city: isOwnProfile || privacyMap['show_location'] !== false ? user.city : null,
      xHandle: user.xHandle,
      createdAt: user.createdAt,

      // Privacy-aware sections
      skills: isOwnProfile || privacyMap['show_skills'] !== false
        ? user.skills.map(us => ({ id: us.skill.id, name: us.skill.name }))
        : null,
      interests: isOwnProfile || privacyMap['show_interests'] !== false
        ? user.interests.map(ui => ({ id: ui.interest.id, name: ui.interest.name }))
        : null,
      roles: user.profileRoles.map(r => ({ role: r.role, detail: r.roleDetail })),
      currentProject: isOwnProfile || privacyMap['show_current_project'] !== false
        ? { type: user.currentProjectType, text: user.currentProjectText }
        : null,
      socialLinks: isOwnProfile || privacyMap['show_socials'] !== false
        ? user.socialLinks.filter(s => isOwnProfile || s.isPublic).map(s => ({
            platform: s.platform, handle: s.handle, url: s.url,
          }))
        : null,
      customLinks: isOwnProfile ? user.customLinks : user.customLinks.filter(l => l.isPublic),
      badges: isOwnProfile || privacyMap['show_badges'] !== false
        ? user.badges.map(ub => ({
            id: ub.badge.id, name: ub.badge.name, emoji: ub.badge.emoji,
            iconUrl: ub.badge.iconUrl, category: ub.badge.category,
            rarity: ub.badge.rarity, isPinned: ub.isPinned, unlockedAt: ub.unlockedAt,
          }))
        : null,
      regions: user.regionMemberships.map(m => ({
        id: m.region.id, name: m.region.name, slug: m.region.slug,
        logoUrl: m.region.logoUrl, role: m.role, isPrimary: m.isPrimary,
      })),
      wallets: isOwnProfile || privacyMap['show_wallet'] !== false
        ? user.wallets
        : null,

      isOwnProfile,
    };
  }

  // ----------------------------------------------------------
  // My Profile (Edit)
  // ----------------------------------------------------------

  async getMyProfile(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        skills: { include: { skill: true } },
        interests: { include: { interest: true } },
        profileRoles: true,
        socialLinks: { orderBy: { sortOrder: 'asc' } },
        customLinks: { orderBy: { sortOrder: 'asc' } },
        wallets: { orderBy: [{ isPrimary: 'desc' }, { connectedAt: 'desc' }] },
        privacySettings: true,
        regionMemberships: {
          where: { isActive: true },
          include: { region: { select: { id: true, name: true, slug: true } } },
        },
      },
    });

    if (!user) throw new AppError('NOT_FOUND', 'User not found');

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      coverPhotoUrl: user.coverPhotoUrl,
      bio: user.bio,
      title: user.title,
      xHandle: user.xHandle,
      availability: user.availability,
      currentProjectType: user.currentProjectType,
      currentProjectText: user.currentProjectText,
      country: user.country,
      city: user.city,
      totalXp: user.totalXp,
      level: user.level,
      onboardingCompleted: user.onboardingCompleted,
      twoFactorEnabled: user.twoFactorEnabled,
      skills: user.skills.map(us => ({ id: us.skill.id, name: us.skill.name })),
      interests: user.interests.map(ui => ({ id: ui.interest.id, name: ui.interest.name })),
      roles: user.profileRoles.map(r => ({ role: r.role, detail: r.roleDetail })),
      socialLinks: user.socialLinks.map(s => ({
        platform: s.platform, handle: s.handle, url: s.url, isPublic: s.isPublic,
      })),
      customLinks: user.customLinks.map(l => ({
        id: l.id, label: l.label, url: l.url, isPublic: l.isPublic,
      })),
      wallets: user.wallets.map(w => ({
        id: w.id, address: w.address, chain: w.chain, label: w.label, isPrimary: w.isPrimary,
      })),
      privacySettings: Object.fromEntries(
        user.privacySettings.map(p => [p.settingKey, p.enabled])
      ),
      regions: user.regionMemberships.map(m => ({
        id: m.region.id, name: m.region.name, slug: m.region.slug,
        role: m.role, status: m.status, isPrimary: m.isPrimary,
      })),
    };
  }

  async updateProfile(userId: string, data: {
    displayName?: string;
    username?: string;
    bio?: string;
    title?: string;
    xHandle?: string;
    availability?: string;
    currentProjectType?: string;
    currentProjectText?: string;
    country?: string;
    city?: string;
    avatarUrl?: string;
    coverPhotoUrl?: string;
  }) {
    // Check username uniqueness if changing
    if (data.username) {
      const existing = await db.user.findUnique({
        where: { username: data.username },
        select: { id: true },
      });
      if (existing && existing.id !== userId) {
        throw new AppError('CONFLICT', 'Username already taken');
      }
    }

    const user = await db.user.update({
      where: { id: userId },
      data,
    });

    await auditService.log({
      userId,
      module: 'profile',
      action: 'profile.updated',
      entityType: 'user',
      entityId: userId,
      details: { fields: Object.keys(data) },
    });

    return user;
  }

  // ----------------------------------------------------------
  // Skills
  // ----------------------------------------------------------

  async searchSkills(query: string, limit: number = 20) {
    return db.skill.findMany({
      where: { name: { contains: query, mode: 'insensitive' } },
      take: limit,
      orderBy: { name: 'asc' },
    });
  }

  async updateSkills(userId: string, skillNames: string[]) {
    // Delete existing
    await db.userSkill.deleteMany({ where: { userId } });

    // Find or create skills, then link
    for (const name of skillNames) {
      const skill = await db.skill.upsert({
        where: { name },
        update: {},
        create: { name },
      });
      await db.userSkill.create({
        data: { userId, skillId: skill.id },
      });
    }
  }

  // ----------------------------------------------------------
  // Interests
  // ----------------------------------------------------------

  async updateInterests(userId: string, interestData: Array<{ id?: string; name?: string }>) {
    await db.userInterest.deleteMany({ where: { userId } });

    for (const item of interestData.slice(0, 10)) {
      let interestId: string;
      if (item.id) {
        interestId = item.id;
      } else if (item.name) {
        const interest = await db.interest.upsert({
          where: { name: item.name },
          update: {},
          create: { name: item.name, isPredefined: false },
        });
        interestId = interest.id;
      } else continue;

      await db.userInterest.create({ data: { userId, interestId } });
    }
  }

  // ----------------------------------------------------------
  // Roles
  // ----------------------------------------------------------

  async updateRoles(userId: string, roles: Array<{ role: string; detail?: string }>) {
    await db.userProfileRole.deleteMany({ where: { userId } });

    for (const r of roles.slice(0, 3)) {
      await db.userProfileRole.create({
        data: { userId, role: r.role, roleDetail: r.detail },
      });
    }
  }

  // ----------------------------------------------------------
  // Social Links
  // ----------------------------------------------------------

  async updateSocials(userId: string, data: {
    platforms: Array<{ platform: string; handle: string; url?: string; isPublic?: boolean }>;
    customLinks: Array<{ label: string; url: string; isPublic?: boolean }>;
  }) {
    await db.$transaction(async (tx) => {
      // Upsert platform links
      await tx.userSocialLink.deleteMany({ where: { userId } });
      for (let i = 0; i < data.platforms.length; i++) {
        const p = data.platforms[i];
        if (!p.handle) continue;
        await tx.userSocialLink.create({
          data: {
            userId,
            platform: p.platform,
            handle: p.handle,
            url: p.url,
            isPublic: p.isPublic ?? true,
            sortOrder: i,
          },
        });
      }

      // Replace custom links
      await tx.userCustomLink.deleteMany({ where: { userId } });
      for (let i = 0; i < data.customLinks.length; i++) {
        const l = data.customLinks[i];
        await tx.userCustomLink.create({
          data: {
            userId,
            label: l.label,
            url: l.url,
            isPublic: l.isPublic ?? true,
            sortOrder: i,
          },
        });
      }
    });
  }

  // ----------------------------------------------------------
  // Privacy Settings
  // ----------------------------------------------------------

  async getPrivacySettings(userId: string) {
    const settings = await db.userPrivacySetting.findMany({ where: { userId } });
    return Object.fromEntries(settings.map(s => [s.settingKey, s.enabled]));
  }

  async updatePrivacySettings(userId: string, settings: Record<string, boolean>) {
    for (const [key, enabled] of Object.entries(settings)) {
      await db.userPrivacySetting.upsert({
        where: { userId_settingKey: { userId, settingKey: key } },
        update: { enabled },
        create: { userId, settingKey: key, enabled },
      });
    }
  }

  // ----------------------------------------------------------
  // Wallets
  // ----------------------------------------------------------

  async connectWallet(userId: string, data: { address: string; chain?: string; label?: string }) {
    // Check if wallet already connected by another user
    const existing = await db.userWallet.findFirst({
      where: { address: data.address },
    });
    if (existing && existing.userId !== userId) {
      throw new AppError('CONFLICT', 'This wallet is connected to another account');
    }

    const wallet = await db.userWallet.upsert({
      where: { userId_address: { userId, address: data.address } },
      update: { chain: data.chain || 'ethereum', label: data.label },
      create: {
        userId,
        address: data.address,
        chain: data.chain || 'ethereum',
        label: data.label,
      },
    });

    // If first wallet, make it primary
    const count = await db.userWallet.count({ where: { userId } });
    if (count === 1) {
      await db.userWallet.update({
        where: { id: wallet.id },
        data: { isPrimary: true },
      });
    }

    return wallet;
  }

  async disconnectWallet(userId: string, walletId: string) {
    const wallet = await db.userWallet.findFirst({
      where: { id: walletId, userId },
    });
    if (!wallet) throw new AppError('NOT_FOUND', 'Wallet not found');

    await db.userWallet.delete({ where: { id: walletId } });

    // If was primary, promote another
    if (wallet.isPrimary) {
      const next = await db.userWallet.findFirst({ where: { userId } });
      if (next) {
        await db.userWallet.update({ where: { id: next.id }, data: { isPrimary: true } });
      }
    }
  }

  async setPrimaryWallet(userId: string, walletId: string) {
    const wallet = await db.userWallet.findFirst({ where: { id: walletId, userId } });
    if (!wallet) throw new AppError('NOT_FOUND', 'Wallet not found');

    await db.$transaction([
      db.userWallet.updateMany({ where: { userId }, data: { isPrimary: false } }),
      db.userWallet.update({ where: { id: walletId }, data: { isPrimary: true } }),
    ]);
  }

  // ----------------------------------------------------------
  // Activity
  // ----------------------------------------------------------

  async getActivity(username: string, viewerId: string | undefined, page: number, limit: number, filter?: string) {
    const user = await db.user.findUnique({ where: { username }, select: { id: true } });
    if (!user) throw new AppError('NOT_FOUND', 'User not found');

    const isOwn = viewerId === user.id;
    const where: Record<string, unknown> = { userId: user.id };
    if (!isOwn) where.isPublic = true;
    if (filter && filter !== 'all') where.sourceModule = filter;

    const [activities, total] = await Promise.all([
      db.userActivity.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.userActivity.count({ where }),
    ]);

    return { activities, total };
  }

  // ----------------------------------------------------------
  // Claims
  // ----------------------------------------------------------

  async getClaimables(userId: string) {
    const [badges, poaps, rewards] = await Promise.all([
      db.userBadge.findMany({
        where: { userId, isClaimed: false },
        include: { badge: true },
        orderBy: { unlockedAt: 'desc' },
      }),
      db.userPoap.findMany({
        where: { userId, isEligible: true, isClaimed: false },
        include: { poap: true },
      }),
      db.userReward.findMany({
        where: { userId, status: 'available' },
        include: { reward: true },
      }),
    ]);

    return {
      badges: badges.map(ub => ({
        userBadgeId: ub.id, ...ub.badge, unlockedAt: ub.unlockedAt,
      })),
      poaps: poaps.map(up => ({
        userPoapId: up.id, ...up.poap,
      })),
      rewards: rewards.map(ur => ({
        userRewardId: ur.id, ...ur.reward,
      })),
      counts: { badges: badges.length, poaps: poaps.length, rewards: rewards.length },
    };
  }

  async claimBadge(userId: string, badgeId: string) {
    const ub = await db.userBadge.findUnique({
      where: { userId_badgeId: { userId, badgeId } },
      include: { badge: true },
    });
    if (!ub) throw new AppError('NOT_FOUND', 'Badge not found');
    if (ub.isClaimed) throw new AppError('CONFLICT', 'Badge already claimed');

    await db.$transaction(async (tx) => {
      await tx.userBadge.update({
        where: { id: ub.id },
        data: { isClaimed: true, claimedAt: new Date() },
      });

      if (ub.badge.bonusXp > 0) {
        await xpService.award(tx, {
          userId,
          amount: ub.badge.bonusXp,
          sourceType: 'badge_bonus',
          sourceId: badgeId,
          description: `Badge claimed: ${ub.badge.name}`,
        });
      }
    });

    return { message: 'Badge claimed', xpAwarded: ub.badge.bonusXp };
  }

  async claimPoap(userId: string, poapId: string) {
    const up = await db.userPoap.findUnique({
      where: { userId_poapId: { userId, poapId } },
      include: { poap: true },
    });
    if (!up) throw new AppError('NOT_FOUND', 'POAP not found');
    if (up.isClaimed) throw new AppError('CONFLICT', 'POAP already claimed');
    if (!up.isEligible) throw new AppError('FORBIDDEN', 'Not eligible for this POAP');

    // Check wallet
    const wallet = await db.userWallet.findFirst({
      where: { userId, isPrimary: true },
    });
    if (!wallet) {
      throw new AppError('VALIDATION_ERROR', 'Connect a wallet first to claim POAPs');
    }

    // Mark as claimed (actual minting is async)
    await db.userPoap.update({
      where: { id: up.id },
      data: { isClaimed: true, claimedAt: new Date() },
    });

    // TODO: Queue actual POAP mint transaction
    return { message: 'POAP claim initiated', walletAddress: wallet.address };
  }

  async claimReward(userId: string, rewardId: string) {
    const ur = await db.userReward.findUnique({
      where: { userId_rewardId: { userId, rewardId } },
      include: { reward: true },
    });
    if (!ur) throw new AppError('NOT_FOUND', 'Reward not found');
    if (ur.status !== 'available') throw new AppError('CONFLICT', 'Reward already claimed');

    if (ur.reward.shippingRequired) {
      throw new AppError('VALIDATION_ERROR', 'Shipping info required. Use the shipping endpoint.');
    }

    await db.userReward.update({
      where: { id: ur.id },
      data: { status: 'claimed', claimedAt: new Date() },
    });

    // Increment claim count
    await db.reward.update({
      where: { id: rewardId },
      data: { currentClaims: { increment: 1 } },
    });

    return { message: 'Reward claimed' };
  }

  async submitShipping(userId: string, rewardId: string, data: {
    name: string; address: string; notes?: string;
  }) {
    const ur = await db.userReward.findUnique({
      where: { userId_rewardId: { userId, rewardId } },
    });
    if (!ur) throw new AppError('NOT_FOUND', 'Reward not found');
    if (ur.status !== 'available') throw new AppError('CONFLICT', 'Reward already claimed');

    await db.userReward.update({
      where: { id: ur.id },
      data: {
        status: 'claimed',
        claimedAt: new Date(),
        shippingName: data.name,
        shippingAddress: data.address,
        shippingNotes: data.notes,
      },
    });

    await db.reward.update({
      where: { id: rewardId },
      data: { currentClaims: { increment: 1 } },
    });

    return { message: 'Reward claimed with shipping info' };
  }

  // ----------------------------------------------------------
  // Account Management
  // ----------------------------------------------------------

  async deactivateAccount(userId: string) {
    await db.user.update({
      where: { id: userId },
      data: { isActive: false, deactivatedAt: new Date() },
    });
    // Invalidate all sessions
    await db.authSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
    await auditService.log({
      userId, module: 'profile', action: 'profile.deactivated', severity: 'sensitive',
    });
  }

  async requestDeletion(userId: string) {
    const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await db.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        deletionRequestedAt: new Date(),
        deletionScheduledAt: deletionDate,
      },
    });
    await db.authSession.updateMany({
      where: { userId, isActive: true },
      data: { isActive: false },
    });
    await auditService.log({
      userId, module: 'profile', action: 'profile.deletion_requested', severity: 'critical',
    });
    return { scheduledAt: deletionDate };
  }

  // ----------------------------------------------------------
  // Onboarding
  // ----------------------------------------------------------

  async completeOnboarding(userId: string) {
    await db.user.update({
      where: { id: userId },
      data: { onboardingCompleted: true },
    });

    // Award profile completion XP
    await xpService.awardStandalone({
      userId,
      amount: 50,
      sourceType: 'profile_complete',
      description: 'Completed onboarding',
    });

    return { message: 'Onboarding complete', xpAwarded: 50 };
  }

  // ----------------------------------------------------------
  // Helpers
  // ----------------------------------------------------------

  private buildPrivacyMap(settings: Array<{ settingKey: string; enabled: boolean }>): Record<string, boolean> {
    const map: Record<string, boolean> = {};
    for (const s of settings) {
      map[s.settingKey] = s.enabled;
    }
    return map;
  }
}

export const profileService = new ProfileService();
