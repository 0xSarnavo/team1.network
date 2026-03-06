import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Syne, DM_Sans } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['600', '700', '800'],
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'team1 Network',
  description: 'Web3 Community Platform',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${dmSans.variable} antialiased bg-background text-zinc-900 dark:text-zinc-100 min-h-screen`}>
        <Providers>
          <div className="relative z-10 flex min-h-screen flex-col w-full">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
