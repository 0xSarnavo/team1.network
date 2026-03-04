import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/auth-context';
import { 
  BarChart, 
  Users, 
  ShieldAlert, 
  UserCog, 
  Settings, 
  Home, 
  LayoutTemplate, 
  Info, 
  Megaphone, 
  Briefcase, 
  Globe2, 
  PanelBottom, 
  Award, 
  CheckSquare, 
  AppWindow, 
  Navigation, 
  UsersRound, 
  CalendarDays, 
  Target, 
  BookOpen, 
  LineChart,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut
} from 'lucide-react';

interface SidebarLink {
  href: string;
  label: string;
  module?: string;
  icon?: React.ReactNode;
}

interface SidebarSection {
  title: string;
  icon?: React.ReactNode;
  links: SidebarLink[];
}

const sections: SidebarSection[] = [
  {
    title: 'Admin Hub',
    icon: <BarChart className="w-4 h-4" />,
    links: [
      { href: '/admin', label: 'Dashboard', icon: <BarChart className="w-4 h-4" /> },
      { href: '/admin/users', label: 'Users', icon: <Users className="w-4 h-4" /> },
      { href: '/admin/audit', label: 'Audit Log', icon: <ShieldAlert className="w-4 h-4" /> },
      { href: '/admin/leads', label: 'Module Leads', icon: <UserCog className="w-4 h-4" /> },
      { href: '/admin/super-admins', label: 'Super Admins', icon: <ShieldAlert className="w-4 h-4" /> },
      { href: '/admin/settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Home',
    icon: <Home className="w-4 h-4" />,
    links: [
      { href: '/home/admin', label: 'Overview', module: 'home', icon: <Home className="w-4 h-4" /> },
      { href: '/home/admin/hero', label: 'Hero', module: 'home', icon: <LayoutTemplate className="w-4 h-4" /> },
      { href: '/home/admin/about', label: 'About', module: 'home', icon: <Info className="w-4 h-4" /> },
      { href: '/home/admin/announcements', label: 'Announcements', module: 'home', icon: <Megaphone className="w-4 h-4" /> },
      { href: '/home/admin/stats', label: 'Stats', module: 'home', icon: <BarChart className="w-4 h-4" /> },
      { href: '/home/admin/partners', label: 'Partners', module: 'home', icon: <Briefcase className="w-4 h-4" /> },
      { href: '/home/admin/regions', label: 'Regions', module: 'home', icon: <Globe2 className="w-4 h-4" /> },
      { href: '/home/admin/footer', label: 'Footer', module: 'home', icon: <PanelBottom className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Bounties',
    icon: <Award className="w-4 h-4" />,
    links: [
      { href: '/admin/bounties', label: 'All Bounties', module: 'bounty', icon: <Award className="w-4 h-4" /> },
      { href: '/admin/bounties/submissions', label: 'Submissions', module: 'bounty', icon: <CheckSquare className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Portal',
    icon: <AppWindow className="w-4 h-4" />,
    links: [
      { href: '/portal/admin', label: 'Overview', module: 'portal', icon: <AppWindow className="w-4 h-4" /> },
      { href: '/portal/admin/regions', label: 'Regions', module: 'portal', icon: <Navigation className="w-4 h-4" /> },
      { href: '/portal/admin/members', label: 'Members', module: 'portal', icon: <UsersRound className="w-4 h-4" /> },
      { href: '/portal/admin/events', label: 'Events', module: 'portal', icon: <CalendarDays className="w-4 h-4" /> },
      { href: '/portal/admin/quests', label: 'Quests', module: 'portal', icon: <Target className="w-4 h-4" /> },
      { href: '/portal/admin/guides', label: 'Guides', module: 'portal', icon: <BookOpen className="w-4 h-4" /> },
      { href: '/portal/admin/analytics', label: 'Analytics', module: 'portal', icon: <LineChart className="w-4 h-4" /> },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { hasModuleLead, isSuperAdmin } = useAuth();
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Admin Hub': true,
    'Home': false,
    'Bounties': false,
    'Portal': false,
  });

  const toggleSection = (title: string) => {
    if (isMinimized) {
      setIsMinimized(false);
      setExpandedSections({ [title]: true });
    } else {
       setExpandedSections(prev => ({ ...prev, [title]: !prev[title] }));
    }
  };

  return (
    <aside className={`relative flex flex-col h-full border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 transition-all duration-300 ease-in-out ${isMinimized ? 'w-[72px]' : 'w-64'}`}>
      
      {/* Header / Logo Area */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4">
        {!isMinimized && (
          <Link href="/" className="text-xl font-bold text-red-500 truncate">
            team1 admin
          </Link>
        )}
        <button 
          onClick={() => setIsMinimized(!isMinimized)}
          className={`rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors ${isMinimized ? 'mx-auto' : ''}`}
          title={isMinimized ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isMinimized ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 overflow-y-auto p-4 hide-scrollbar">
        {sections.map((section) => {
          const visibleLinks = section.links.filter(
             (link) => !link.module || isSuperAdmin || hasModuleLead(link.module)
          );
          if (visibleLinks.length === 0) return null;

          const isExpanded = expandedSections[section.title];
          const hasActiveLink = visibleLinks.some(link => pathname === link.href);

          return (
            <div key={section.title} className="mb-2">
              <button 
                onClick={() => toggleSection(section.title)}
                className={`flex w-full items-center justify-between rounded-lg p-2 text-sm font-medium transition-colors ${
                  isMinimized ? 'justify-center' : ''
                } hover:bg-zinc-100 dark:hover:bg-zinc-800/50 ${hasActiveLink && !isExpanded && !isMinimized ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}
                title={section.title}
              >
                <div className="flex items-center gap-3">
                  <div className={`${hasActiveLink ? 'text-red-500' : ''}`}>
                    {section.icon}
                  </div>
                  {!isMinimized && <span>{section.title}</span>}
                </div>
                {!isMinimized && (
                   <div className="text-zinc-500">
                     {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                   </div>
                )}
              </button>
              
              {!isMinimized && isExpanded && (
                <ul className="mt-1 space-y-1 pl-9 pr-2">
                  {visibleLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className={`flex items-center gap-3 rounded-md px-2 py-2 text-xs transition-colors ${
                            isActive
                              ? 'bg-red-500/10 text-red-500 font-semibold'
                              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200'
                          }`}
                        >
                          {/* Optional: if you want icons on child links too, uncomment below */}
                          {/* <div className="opacity-70">{link.icon}</div> */}
                          <span className="truncate">{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Footer Area */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 shrink-0">
        <Link 
          href="/" 
          className={`flex items-center rounded-lg p-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors ${isMinimized ? 'justify-center' : 'gap-3'}`}
          title="Exit Admin"
        >
          <LogOut className="h-5 w-5" />
          {!isMinimized && <span>Exit Admin</span>}
        </Link>
      </div>
    </aside>
  );
}
