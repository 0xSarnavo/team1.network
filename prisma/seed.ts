import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import bcrypt from 'bcryptjs';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // ============================================================
  // 1. Super Admin User
  // ============================================================
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@platform.com' },
    update: {},
    create: {
      email: 'admin@platform.com',
      passwordHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      username: 'admin',
      displayName: 'Platform Admin',
      bio: 'Platform super administrator',
      isActive: true,
      onboardingCompleted: true,
    },
  });

  await prisma.platformAdmin.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
      role: 'super_super_admin',
      isActive: true,
    },
  });
  console.log('  Admin: admin@platform.com / Admin123!');

  // ============================================================
  // 2. Demo User
  // ============================================================
  const demoHash = await bcrypt.hash('Demo1234!', 12);
  const demo = await prisma.user.upsert({
    where: { email: 'demo@platform.com' },
    update: {},
    create: {
      email: 'demo@platform.com',
      passwordHash: demoHash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      username: 'demo',
      displayName: 'Demo User',
      bio: 'Exploring the platform',
      country: 'India',
      city: 'Bangalore',
      isActive: true,
      onboardingCompleted: true,
      totalXp: 150,
      level: 2,
    },
  });
  console.log('  Demo: demo@platform.com / Demo1234!');

  // ============================================================
  // 2b. Core User 1 (will be assigned as India Region Lead by super admin)
  // ============================================================
  const core1Hash = await bcrypt.hash('Core1234!', 12);
  const core1 = await prisma.user.upsert({
    where: { email: 'core1@platform.com' },
    update: {},
    create: {
      email: 'core1@platform.com',
      passwordHash: core1Hash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      username: 'core_india',
      displayName: 'India Core Lead',
      bio: 'Regional core team member for India',
      country: 'India',
      city: 'Mumbai',
      isActive: true,
      onboardingCompleted: true,
      totalXp: 500,
      level: 4,
    },
  });
  console.log('  Core1: core1@platform.com / Core1234!');

  // ============================================================
  // 2c. Core User 2 (will be assigned as Dubai Region Lead by super admin)
  // ============================================================
  const core2Hash = await bcrypt.hash('Core1234!', 12);
  const core2 = await prisma.user.upsert({
    where: { email: 'core2@platform.com' },
    update: {},
    create: {
      email: 'core2@platform.com',
      passwordHash: core2Hash,
      emailVerified: true,
      emailVerifiedAt: new Date(),
      username: 'core_dubai',
      displayName: 'Dubai Core Lead',
      bio: 'Regional core team member for Dubai',
      country: 'UAE',
      city: 'Dubai',
      isActive: true,
      onboardingCompleted: true,
      totalXp: 350,
      level: 3,
    },
  });
  console.log('  Core2: core2@platform.com / Core1234!');

  // ============================================================
  // 3. Regions
  // ============================================================
  const regions = [
    { name: 'India', slug: 'india', country: 'India', city: 'Multiple cities', description: 'Indian Avalanche community hub.' },
    { name: 'Dubai', slug: 'dubai', country: 'UAE', city: 'Dubai', description: 'Dubai & Middle East Avalanche community.' },
    { name: 'Singapore', slug: 'singapore', country: 'Singapore', city: 'Singapore', description: 'Southeast Asia Avalanche community.' },
    { name: 'Nigeria', slug: 'nigeria', country: 'Nigeria', city: 'Lagos', description: 'African Avalanche community hub.' },
    { name: 'Turkey', slug: 'turkey', country: 'Turkey', city: 'Istanbul', description: 'Turkish Avalanche community.' },
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { slug: region.slug },
      update: {},
      create: region,
    });
  }
  console.log(`  ${regions.length} regions`);

  // Add demo user to India region
  const indiaRegion = await prisma.region.findUnique({ where: { slug: 'india' } });
  if (indiaRegion) {
    await prisma.userRegionMembership.upsert({
      where: { userId_regionId: { userId: demo.id, regionId: indiaRegion.id } },
      update: {},
      create: {
        userId: demo.id,
        regionId: indiaRegion.id,
        isPrimary: true,
        role: 'member',
        status: 'accepted',
        acceptedAt: new Date(),
      },
    });
  }

  // ============================================================
  // 4. Home Page Content
  // ============================================================
  const existingHero = await prisma.homeHero.findFirst();
  if (!existingHero) {
    await prisma.homeHero.create({
      data: {
        heading: 'Build the Future with Avalanche',
        subheading: 'Join a global community of builders, creators, and innovators shaping the decentralized future.',
        backgroundType: 'gradient',
        ctas: [
          { label: 'Get Started', url: '/auth/signup', variant: 'primary' },
          { label: 'Explore Portal', url: '/portal', variant: 'secondary' },
        ],
        isActive: true,
      },
    });
  }

  const existingAbout = await prisma.homeAbout.findFirst();
  if (!existingAbout) {
    await prisma.homeAbout.create({
      data: {
        content: 'We are a vibrant community of Web3 builders and enthusiasts united by the Avalanche ecosystem. Our mission is to foster innovation, collaboration, and growth across regions worldwide.',
      },
    });
  }

  const existingFooter = await prisma.homeFooter.findFirst();
  if (!existingFooter) {
    await prisma.homeFooter.create({
      data: {
        tagline: 'Building the decentralized future, together.',
        copyright: '© 2025 Avalanche Community Platform',
        columns: [
          { title: 'Platform', links: [{ label: 'Portal', url: '/portal' }, { label: 'Events', url: '/portal/events' }, { label: 'Quests', url: '/portal/quests' }] },
          { title: 'Community', links: [{ label: 'Members', url: '/portal/members' }, { label: 'Regions', url: '/portal' }, { label: 'Guides', url: '/portal/guides' }] },
        ],
        socials: [
          { platform: 'twitter', url: 'https://twitter.com/avaborshq' },
          { platform: 'discord', url: 'https://discord.gg/avax' },
        ],
      },
    });
  }

  // Stats
  const statsExist = await prisma.homeStat.count();
  if (statsExist === 0) {
    await prisma.homeStat.createMany({
      data: [
        { label: 'Community Members', autoKey: 'total_users', useAuto: true, sortOrder: 0 },
        { label: 'Regions', autoKey: 'total_regions', useAuto: true, sortOrder: 1 },
        { label: 'Events Hosted', autoKey: 'total_events', useAuto: true, sortOrder: 2 },
        { label: 'Quests Completed', autoKey: 'total_quest_completions', useAuto: true, sortOrder: 3 },
      ],
    });
  }

  // Announcements
  const announcementCount = await prisma.homeAnnouncement.count();
  if (announcementCount === 0) {
    await prisma.homeAnnouncement.createMany({
      data: [
        { title: 'Welcome to the Platform!', summary: 'Our community platform is now live!', content: 'Explore regions, join events, and complete quests to earn XP.', status: 'published', sortOrder: 0, createdBy: admin.id },
        { title: 'Quest System Live', summary: 'Earn XP by completing quests.', content: 'Complete quests to earn XP and climb the leaderboard.', status: 'published', sortOrder: 1, createdBy: admin.id },
      ],
    });
  }

  // Region Cards
  const allRegions = await prisma.region.findMany();
  const regionCardCount = await prisma.homeRegionCard.count();
  if (regionCardCount === 0) {
    await prisma.homeRegionCard.createMany({
      data: allRegions.map((r, i) => ({
        regionId: r.id,
        description: r.description || `Join the ${r.name} community`,
        isVisible: true,
        sortOrder: i,
      })),
    });
  }

  console.log('  Home page content seeded');

  // ============================================================
  // 5. Platform Settings
  // ============================================================
  const settings: Record<string, unknown> = {
    'general.name': 'Avalanche Community',
    'general.url': 'https://platform.com',
    'modules.portal': true,
    'modules.grants': true,
    'modules.bounty': true,
    'modules.ecosystem': true,
    'modules.home': true,
    'xp.level_curve': [0, 100, 250, 500, 1000, 1500, 2000, 2500, 3000, 4000],
    'registration.open': true,
    'registration.emailVerificationRequired': true,
    'security.sessionDuration': 30,
    'security.enforce2FA': false,
  };

  for (const [key, value] of Object.entries(settings)) {
    await prisma.platformSetting.upsert({
      where: { key },
      update: {},
      create: { key, value: value as any },
    });
  }
  console.log('  Platform settings seeded');

  // ============================================================
  // 6. Skills & Interests
  // ============================================================
  const skills = [
    'Solidity', 'Rust', 'TypeScript', 'JavaScript', 'Python', 'Go',
    'React', 'Next.js', 'Node.js', 'Smart Contracts', 'DeFi',
    'UI/UX Design', 'Product Management', 'Community Management',
    'Content Writing', 'Marketing', 'Data Analysis', 'Security Auditing',
    'DevOps', 'Mobile Development',
  ];

  for (const name of skills) {
    await prisma.skill.upsert({ where: { name }, update: {}, create: { name } });
  }

  const interests = [
    'DeFi', 'NFTs', 'Gaming', 'DAO', 'Infrastructure', 'Social', 'Mobile',
    'Zero Knowledge', 'Consumer', 'AI', 'RWAs', 'Security', 'Analytics',
    'Trading', 'Governance',
  ];

  for (const name of interests) {
    await prisma.interest.upsert({ where: { name }, update: {}, create: { name, isPredefined: true } });
  }
  console.log(`  ${skills.length} skills, ${interests.length} interests`);

  // ============================================================
  // 7. Sample Portal Content
  // ============================================================
  const eventCount = await prisma.portalEvent.count();
  if (eventCount === 0 && indiaRegion) {
    await prisma.portalEvent.create({
      data: {
        title: 'Avalanche Builder Meetup',
        slug: 'avalanche-builder-meetup-2025',
        description: 'Join fellow Avalanche builders for talks, workshops, and networking.',
        type: 'meetup',
        status: 'published',
        regionId: indiaRegion.id,
        location: 'Bangalore',
        isVirtual: false,
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000),
        timezone: 'Asia/Kolkata',
        capacity: 100,
        createdBy: admin.id,
      },
    });
  }

  const questCount = await prisma.portalQuest.count();
  if (questCount === 0) {
    await prisma.portalQuest.createMany({
      data: [
        { title: 'Complete Your Profile', description: 'Fill out your profile with bio, skills, and social links.', category: 'onboarding', type: 'single_action', xpReward: 50, difficulty: 'easy', proofType: 'url', isActive: true, createdBy: admin.id },
        { title: 'Join a Region', description: 'Apply to join a regional community.', category: 'onboarding', type: 'single_action', xpReward: 30, difficulty: 'easy', proofType: 'url', isActive: true, createdBy: admin.id },
        { title: 'Attend Your First Event', description: 'RSVP and attend any community event.', category: 'community', type: 'single_action', xpReward: 100, difficulty: 'medium', proofType: 'url', isActive: true, createdBy: admin.id },
      ],
    });
  }

  const guideCount = await prisma.portalGuide.count();
  if (guideCount === 0) {
    await prisma.portalGuide.create({
      data: {
        title: 'Getting Started with the Community',
        slug: 'getting-started',
        category: 'onboarding',
        content: '# Welcome\n\nThis guide helps you get started.\n\n## Step 1: Complete Your Profile\n\nAdd your bio, skills, and interests.\n\n## Step 2: Join a Region\n\nBrowse and apply to a region.\n\n## Step 3: Complete Quests\n\nEarn XP by completing quests.\n\n## Step 4: Attend Events\n\nJoin meetups and hackathons.',
        readTime: 3,
        status: 'published',
        authorId: admin.id,
      },
    });
  }

  console.log('  Sample portal content seeded');
  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
