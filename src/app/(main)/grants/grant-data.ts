// Shared grant data used by listing and detail pages

export interface Grant {
  slug: string;
  title: string;
  amount: string;
  description: string;
  image: string | null;
  featured?: boolean;
}

export const mainGrant: Grant = {
  slug: 'builder-grants',
  title: 'Builder Grants',
  amount: 'Up to $50,000',
  description: 'Our flagship funding program for developers building on the ecosystem. Get support for your dApp, protocol, or tooling project with milestone-based tranches.',
  image: null,
  featured: true,
};

export const otherGrants: Grant[] = [
  {
    slug: 'community-grants',
    title: 'Community Grants',
    amount: 'Up to $10,000',
    description: 'Support for community initiatives, education programs, and regional growth efforts.',
    image: null,
  },
  {
    slug: 'research-grants',
    title: 'Research Grants',
    amount: 'Up to $25,000',
    description: 'Funding for academic research, security audits, and technical analysis of blockchain technology.',
    image: null,
  },
  {
    slug: 'creator-grants',
    title: 'Creator Grants',
    amount: 'Up to $5,000',
    description: 'Support for content creators, designers, and artists contributing to the ecosystem.',
    image: null,
  },
  {
    slug: 'security-grants',
    title: 'Security Grants',
    amount: 'Up to $15,000',
    description: 'Funding for security researchers and auditors to improve ecosystem safety.',
    image: null,
  },
  {
    slug: 'education-grants',
    title: 'Education Grants',
    amount: 'Up to $8,000',
    description: 'Support for educators building courses, tutorials, and learning resources.',
    image: null,
  },
];

export const allGrants: Grant[] = [{ ...mainGrant }, ...otherGrants];

// ---------------------------------------------------------------------------
// Categorized FAQ data
// ---------------------------------------------------------------------------

export interface FaqCategory {
  category: string;
  items: { q: string; a: string }[];
}

export const grantFaq: FaqCategory[] = [
  {
    category: 'General Program Info',
    items: [
      { q: 'What is the Team1 Grant?', a: 'Team1 Grant is an independent grant program powered by Team1, designed to support early-stage builders and teams creating innovative projects on the Avalanche ecosystem. While it operates in collaboration with Ava Labs and ecosystem partners, it is not an official Avalanche Foundation grant.' },
      { q: 'Who can apply?', a: 'Anyone building a project on Avalanche — students, solo builders, Team1 members, or startup founders. Applicants must show a working idea, basic prototype, and a clear plan.' },
      { q: 'When do applications close?', a: 'Applications are open year-round. There are no fixed deadlines. Apply when you\'re ready with the required materials.' },
    ],
  },
  {
    category: 'Eligibility & Submission',
    items: [
      { q: 'What stage should my project be at?', a: 'We accept pre-MVP projects with a working prototype or proof-of-concept, a clear mission, early market understanding, basic revenue model, and a website or landing page.' },
      { q: 'What do I need to submit?', a: '1. Whitepaper or one-pager\n2. Prototype (demo, mockups, or walkthrough)\n3. Team intro and roles\n4. Market research summary\n5. Competitor analysis\n6. Revenue model idea\n7. Planned tech stack' },
      { q: 'Do I need a blockchain developer on the team?', a: 'It\'s strongly recommended. Technical feasibility and execution are key selection factors.' },
      { q: 'Can I apply if I\'ve already launched something?', a: 'Yes — as long as you\'re pre-product-market fit and Team1 support can meaningfully accelerate your progress.' },
    ],
  },
  {
    category: 'Grants & Milestones',
    items: [
      { q: 'How are funds paid out?', a: 'Grants are milestone-based. Once a defined milestone (agreed during onboarding) is achieved, the corresponding grant portion is disbursed.' },
      { q: 'What are the funding phases?', a: 'Phase 1 – Application & Evaluation: Submit your whitepaper/litepaper, prototype, market analysis, and other relevant details. Selected projects will be interviewed.\n\nPhase 2 – Milestone Setup & Initial Grants: Selected projects receive initial funding and development credits with project-specific milestones defined collaboratively.\n\nPhase 3 – MVP Launch & User Feedback: Teams receive funding for marketing and user acquisition, with support in reaching their first users.\n\nPhase 4 – Demo Day & Codebase Interview: Projects that have released on testnet or mainnet qualify for Demo Day to pitch to investors and partners.' },
      { q: 'How is the grant amount decided?', a: 'Applicants can propose an amount with a clear usage breakdown. Final decisions are made by Team1 and Ava Labs based on feasibility, scope, and impact.' },
    ],
  },
  {
    category: 'Support & Growth',
    items: [
      { q: 'What support do I get apart from funding?', a: '1. Milestone planning\n2. Technical & strategic mentorship\n3. MVP guidance\n4. User feedback support\n5. Community tester access\n6. Demo Day eligibility' },
      { q: 'What if my project is not selected?', a: 'You\'ll be invited to a builder support track for guidance and reapplication. Our goal is to help you succeed, even on a second attempt.' },
      { q: 'Can I reapply if I was previously rejected?', a: 'Yes. We encourage teams to improve and reapply anytime — applications are always open.' },
    ],
  },
  {
    category: 'Demo Day',
    items: [
      { q: 'What is Demo Day?', a: 'Demo Day is a biannual showcase held twice a year and attended by investors, the Avalabs BD team, and ecosystem partners. Projects present their product to raise funds and build strategic connections. Selected teams will also have the opportunity to interview for Codebase, Avalanche\'s official accelerator program.' },
      { q: 'Who gets invited to Demo Day?', a: 'Projects that have released their product on testnet or mainnet qualify for Demo Day. Teams must have completed their MVP and gathered initial user feedback.' },
      { q: 'Can rejected projects join Demo Day later?', a: 'Yes — projects that iterate and reach MVP with support can be considered for future Demo Days.' },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sample discover projects (placeholder data)
// ---------------------------------------------------------------------------

export interface DiscoverProject {
  id: string;
  title: string;
  description: string;
  image: string | null;
  status: 'Accepted' | 'In Review' | 'Completed';
  tags: string[];
}

export const discoverProjects: DiscoverProject[] = [
  { id: '1', title: 'Xythum Labs', description: 'Xythum\'s Darkpool Gateway is a foundational privacy infrastructure designed to solve DeFi\'s core strategi...', image: null, status: 'Accepted', tags: ['Others', 'DeFi', 'Infrastructure'] },
  { id: '2', title: 'Entropy to Order', description: 'ETO Dynamic Reflective Index Launch Protocol enables real-time, on-chain replication of real-world...', image: null, status: 'Accepted', tags: ['DeFi', 'Infrastructure', 'Others'] },
  { id: '3', title: 'Zappo', description: 'Zappo is a web3 wallet and payment platform built inside WhatsApp, making sending and receiving AVA...', image: null, status: 'Accepted', tags: ['Social', 'Others'] },
  { id: '4', title: 'AvaSwap Protocol', description: 'Decentralized exchange built natively on Avalanche with sub-second trade confirmations and deep liquidity pools...', image: null, status: 'Accepted', tags: ['DeFi', 'Infrastructure'] },
  { id: '5', title: 'Chain Chronicle', description: 'On-chain analytics dashboard providing real-time insights into Avalanche network activity and token flows...', image: null, status: 'In Review', tags: ['Analytics', 'Infrastructure'] },
  { id: '6', title: 'Subnet Studio', description: 'No-code platform for deploying and managing custom Avalanche subnets with built-in monitoring tools...', image: null, status: 'Accepted', tags: ['Infrastructure', 'Developer Tools'] },
];
