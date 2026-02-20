import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Regions
  const regions = [
    { name: 'India', slug: 'india', country: 'India', city: 'Multiple cities' },
    { name: 'Dubai', slug: 'dubai', country: 'UAE', city: 'Dubai' },
    { name: 'Singapore', slug: 'singapore', country: 'Singapore', city: 'Singapore' },
    { name: 'Nigeria', slug: 'nigeria', country: 'Nigeria', city: 'Lagos' },
    { name: 'Turkey', slug: 'turkey', country: 'Turkey', city: 'Istanbul' },
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { slug: region.slug },
      update: {},
      create: region,
    });
  }
  console.log(`Seeded ${regions.length} regions`);

  // Predefined interests
  const interests = [
    'DeFi', 'NFTs', 'Gaming', 'DAO', 'Infrastructure', 'Social', 'Mobile',
    'Zero Knowledge', 'Consumer', 'AI', 'RWAs', 'Security', 'Analytics',
    'Trading', 'Governance',
  ];

  for (const name of interests) {
    await prisma.interest.upsert({
      where: { name },
      update: {},
      create: { name, isPredefined: true },
    });
  }
  console.log(`Seeded ${interests.length} interests`);

  // Platform settings
  const settings = [
    { key: 'general.name', value: 'Platform Name' },
    { key: 'general.url', value: 'https://platform.com' },
    { key: 'modules.portal', value: true },
    { key: 'modules.grants', value: true },
    { key: 'modules.bounty', value: true },
    { key: 'modules.ecosystem', value: true },
    { key: 'modules.home', value: true },
    { key: 'xp.level_curve', value: [0, 100, 250, 500, 1000, 1500, 2000, 2500, 3000, 4000] },
    { key: 'registration.open', value: true },
  ];

  for (const setting of settings) {
    await prisma.platformSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: { key: setting.key, value: setting.value as any },
    });
  }
  console.log(`Seeded ${settings.length} platform settings`);

  // Predefined skills
  const skills = [
    'Solidity', 'Rust', 'TypeScript', 'JavaScript', 'Python', 'Go',
    'React', 'Next.js', 'Node.js', 'Smart Contracts', 'DeFi',
    'UI/UX Design', 'Product Management', 'Community Management',
    'Content Writing', 'Marketing', 'Data Analysis', 'Security Auditing',
    'DevOps', 'Mobile Development',
  ];

  for (const name of skills) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
  console.log(`Seeded ${skills.length} skills`);

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
