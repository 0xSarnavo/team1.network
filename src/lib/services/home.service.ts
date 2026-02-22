import db from '@/lib/db/client';
import { AppError } from '@/lib/helpers/errors';
import { cache } from '@/lib/helpers/cache';
import { Prisma } from '@prisma/client';

// ============================================================
// Home Service
// ============================================================

const CACHE_KEY_HOME = 'home:public';
const CACHE_TTL = 300; // 5 minutes

class HomeService {
  // ----------------------------------------------------------
  // Public Home Page (cached)
  // ----------------------------------------------------------

  async getHomePage() {
    const cached = await cache.get<Record<string, unknown>>(CACHE_KEY_HOME);
    if (cached) return cached;

    const [
      hero,
      about,
      stats,
      announcements,
      regions,
      partners,
      footer,
    ] = await Promise.all([
      db.homeHero.findFirst({ where: { isActive: true } }),
      db.homeAbout.findFirst(),
      db.homeStat.findMany({ orderBy: { sortOrder: 'asc' } }),
      db.homeAnnouncement.findMany({
        where: { status: 'published' },
        orderBy: { sortOrder: 'asc' },
      }),
      db.region.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          description: true,
          _count: {
            select: {
              memberships: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      db.homePartner.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      db.homeFooter.findFirst(),
    ]);

    const regionsWithCounts = regions.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      logoUrl: r.logoUrl,
      description: r.description,
      memberCount: r._count.memberships,
    }));

    const data = {
      hero,
      about,
      stats,
      announcements,
      regions: regionsWithCounts,
      partners,
      footer,
    };

    await cache.set(CACHE_KEY_HOME, data, CACHE_TTL);

    return data;
  }

  // ----------------------------------------------------------
  // Hero Section
  // ----------------------------------------------------------

  async getHero() {
    return db.homeHero.findFirst();
  }

  async updateHero(data: {
    heading?: string;
    subheading?: string;
    backgroundUrl?: string;
    backgroundType?: string;
    ctas?: Prisma.InputJsonValue;
    isActive?: boolean;
    updatedBy?: string;
  }) {
    const existing = await db.homeHero.findFirst();

    let hero;
    if (existing) {
      hero = await db.homeHero.update({
        where: { id: existing.id },
        data,
      });
    } else {
      hero = await db.homeHero.create({
        data: {
          heading: data.heading ?? '',
          ...data,
        },
      });
    }

    await this.invalidateCache();
    return hero;
  }

  // ----------------------------------------------------------
  // About Section
  // ----------------------------------------------------------

  async getAbout() {
    return db.homeAbout.findFirst();
  }

  async updateAbout(data: {
    content?: string;
    imageUrl?: string;
    updatedBy?: string;
  }) {
    const existing = await db.homeAbout.findFirst();

    let about;
    if (existing) {
      about = await db.homeAbout.update({
        where: { id: existing.id },
        data,
      });
    } else {
      about = await db.homeAbout.create({
        data: {
          content: data.content ?? '',
          ...data,
        },
      });
    }

    await this.invalidateCache();
    return about;
  }

  // ----------------------------------------------------------
  // Announcements
  // ----------------------------------------------------------

  async listAnnouncements(page: number, limit: number) {
    const [announcements, total] = await Promise.all([
      db.homeAnnouncement.findMany({
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.homeAnnouncement.count(),
    ]);

    return { announcements, total };
  }

  async createAnnouncement(data: {
    title: string;
    content?: string;
    summary?: string;
    linkUrl?: string;
    sortOrder?: number;
    status?: string;
    createdBy?: string;
  }) {
    const announcement = await db.homeAnnouncement.create({ data });
    await this.invalidateCache();
    return announcement;
  }

  async updateAnnouncement(
    id: string,
    data: {
      title?: string;
      content?: string;
      summary?: string;
      linkUrl?: string;
      sortOrder?: number;
      status?: string;
    }
  ) {
    const existing = await db.homeAnnouncement.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 'Announcement not found');

    const announcement = await db.homeAnnouncement.update({
      where: { id },
      data,
    });

    await this.invalidateCache();
    return announcement;
  }

  async deleteAnnouncement(id: string) {
    const existing = await db.homeAnnouncement.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 'Announcement not found');

    await db.homeAnnouncement.delete({ where: { id } });
    await this.invalidateCache();
  }

  // ----------------------------------------------------------
  // Stats Section (multiple stat rows)
  // ----------------------------------------------------------

  async getStats() {
    return db.homeStat.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async createStat(data: {
    label: string;
    value?: number;
    icon?: string;
    autoKey?: string;
    useAuto?: boolean;
    sortOrder?: number;
  }) {
    const stat = await db.homeStat.create({ data });
    await this.invalidateCache();
    return stat;
  }

  async updateStat(
    id: string,
    data: {
      label?: string;
      value?: number;
      icon?: string;
      autoKey?: string;
      useAuto?: boolean;
      sortOrder?: number;
    }
  ) {
    const existing = await db.homeStat.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 'Stat not found');

    const stat = await db.homeStat.update({ where: { id }, data });
    await this.invalidateCache();
    return stat;
  }

  async deleteStat(id: string) {
    const existing = await db.homeStat.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 'Stat not found');

    await db.homeStat.delete({ where: { id } });
    await this.invalidateCache();
  }

  // ----------------------------------------------------------
  // Partners
  // ----------------------------------------------------------

  async listPartners(page: number, limit: number) {
    const [partners, total] = await Promise.all([
      db.homePartner.findMany({
        orderBy: { sortOrder: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.homePartner.count(),
    ]);

    return { partners, total };
  }

  async createPartner(data: {
    name: string;
    logoUrl: string;
    websiteUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) {
    const partner = await db.homePartner.create({ data });
    await this.invalidateCache();
    return partner;
  }

  async updatePartner(
    id: string,
    data: {
      name?: string;
      logoUrl?: string;
      websiteUrl?: string;
      sortOrder?: number;
      isActive?: boolean;
    }
  ) {
    const existing = await db.homePartner.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 'Partner not found');

    const partner = await db.homePartner.update({
      where: { id },
      data,
    });

    await this.invalidateCache();
    return partner;
  }

  async deletePartner(id: string) {
    const existing = await db.homePartner.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 'Partner not found');

    await db.homePartner.delete({ where: { id } });
    await this.invalidateCache();
  }

  // ----------------------------------------------------------
  // Region Cards (per-region visibility/order)
  // ----------------------------------------------------------

  async getRegionCards() {
    return db.homeRegionCard.findMany({
      where: { isVisible: true },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async upsertRegionCard(data: {
    regionId: string;
    description?: string;
    isVisible?: boolean;
    sortOrder?: number;
  }) {
    const existing = await db.homeRegionCard.findFirst({
      where: { regionId: data.regionId },
    });

    let regionCard;
    if (existing) {
      regionCard = await db.homeRegionCard.update({
        where: { id: existing.id },
        data,
      });
    } else {
      regionCard = await db.homeRegionCard.create({ data });
    }

    await this.invalidateCache();
    return regionCard;
  }

  async deleteRegionCard(id: string) {
    const existing = await db.homeRegionCard.findUnique({ where: { id } });
    if (!existing) throw new AppError('NOT_FOUND', 'Region card not found');

    await db.homeRegionCard.delete({ where: { id } });
    await this.invalidateCache();
  }

  // ----------------------------------------------------------
  // Footer
  // ----------------------------------------------------------

  async getFooter() {
    return db.homeFooter.findFirst();
  }

  async updateFooter(data: {
    tagline?: string;
    copyright?: string;
    columns?: Prisma.InputJsonValue;
    socials?: Prisma.InputJsonValue;
    updatedBy?: string;
  }) {
    const existing = await db.homeFooter.findFirst();

    let footer;
    if (existing) {
      footer = await db.homeFooter.update({
        where: { id: existing.id },
        data,
      });
    } else {
      footer = await db.homeFooter.create({ data });
    }

    await this.invalidateCache();
    return footer;
  }

  // ----------------------------------------------------------
  // Cache Helpers
  // ----------------------------------------------------------

  private async invalidateCache() {
    await cache.del(CACHE_KEY_HOME);
  }
}

export const homeService = new HomeService();
