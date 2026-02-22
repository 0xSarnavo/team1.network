import React from 'react';
import Link from 'next/link';

const footerLinks = [
  {
    title: 'Platform',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Portal', href: '/portal' },
      { label: 'Grants', href: '/grants' },
      { label: 'Bounty', href: '/bounty' },
      { label: 'Ecosystem', href: '/ecosystem' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'Events', href: '/portal/events' },
      { label: 'Members', href: '/portal/members' },
      { label: 'Guides', href: '/portal/guides' },
      { label: 'Leaderboard', href: '/bounty/leaderboard' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'Support', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Logo column */}
          <div>
            <Link href="/" className="text-xl font-bold text-red-500">team1</Link>
            <p className="mt-3 text-sm text-zinc-500">Building the future of Web3 communities.</p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="mb-3 text-sm font-semibold text-zinc-300">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-center text-sm text-zinc-600">
          &copy; {new Date().getFullYear()} team1. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
