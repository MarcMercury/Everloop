'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  BookOpen,
  Globe,
  Plus,
  User,
  LogOut,
  ChevronDown,
  PenTool,
  FileText,
  Send,
  Map,
  Users,
  ScrollText,
  Network,
  Clock,
  Settings,
  Award,
  Crown,
  Menu,
  X,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  children?: NavSubItem[];
}

interface NavSubItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
  },
  {
    id: 'stories',
    label: 'Stories',
    icon: BookOpen,
    children: [
      { label: 'Write New Story', href: '/write', icon: PenTool, description: 'Start a new story' },
      { label: 'My Drafts', href: '/dashboard?filter=drafts', icon: FileText, description: 'Continue your work' },
      { label: 'Published Stories', href: '/dashboard?filter=published', icon: Send, description: 'Your canon contributions' },
      { label: 'Explore Stories', href: '/explore', icon: BookOpen, description: 'Read the universe' },
    ],
  },
  {
    id: 'world',
    label: 'The World',
    icon: Globe,
    children: [
      { label: 'Characters', href: '/characters', icon: Users, description: 'Canon characters' },
      { label: 'Locations', href: '/lore?category=locations', icon: Map, description: 'Places in the universe' },
      { label: 'Lore & Glossary', href: '/lore', icon: ScrollText, description: 'World encyclopedia' },
      { label: 'Canon Weave', href: '/canon', icon: Network, description: 'The living universe' },
      { label: 'Timelines', href: '/paths', icon: Clock, description: 'Story connections' },
    ],
  },
  {
    id: 'create',
    label: 'Create',
    icon: Plus,
    href: '/create',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    children: [
      { label: 'My Profile', href: '/creator', icon: User, description: 'Your contributions' },
      { label: 'Settings', href: '/settings', icon: Settings, description: 'Account settings' },
      { label: 'Achievements', href: '/creator?tab=achievements', icon: Award, description: 'Your badges' },
    ],
  },
];

export default function GlobalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{ display_name?: string; email?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('display_name, email, role')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }
      setLoading(false);
    }

    loadProfile();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const isActive = (item: NavItem) => {
    if (item.href) {
      return pathname === item.href || pathname.startsWith(item.href + '/');
    }
    if (item.children) {
      return item.children.some(child => 
        pathname === child.href || pathname.startsWith(child.href.split('?')[0])
      );
    }
    return false;
  };

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  return (
    <>
      {/* Top Navigation Bar - NEVER CHANGES */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border)]">
        <div className="h-full max-w-[1600px] mx-auto px-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold font-serif hidden sm:block">Everloop</span>
          </Link>

          {/* Desktop Navigation - 5 Core Sections */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <div key={item.id} className="relative">
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive(item)
                        ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'
                        : 'text-[var(--foreground-muted)] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(item.id);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive(item) || openDropdown === item.id
                        ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'
                        : 'text-[var(--foreground-muted)] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium text-sm">{item.label}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${openDropdown === item.id ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Dropdown Menu */}
                {item.children && openDropdown === item.id && (
                  <div 
                    className="absolute top-full left-0 mt-1 w-64 bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl shadow-xl py-2 z-50"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setOpenDropdown(null)}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors"
                      >
                        <child.icon className="w-4 h-4 text-[var(--accent-gold)] mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-white">{child.label}</div>
                          {child.description && (
                            <div className="text-xs text-[var(--foreground-muted)]">{child.description}</div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-3">
            {/* Admin Link */}
            {profile?.role === 'admin' && (
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-1 px-3 py-1.5 text-sm text-[var(--foreground-muted)] hover:text-white transition-colors"
              >
                <Crown className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Info */}
            {!loading && profile && (
              <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-purple)]/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-[var(--accent-purple)]" />
                </div>
                <span className="max-w-[120px] truncate">{profile.display_name || profile.email}</span>
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 text-[var(--foreground-muted)] hover:text-white transition-colors rounded-lg hover:bg-white/5"
              title="Log out"
            >
              <LogOut className="w-5 h-5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[var(--foreground-muted)] hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-[var(--background)] border-b border-[var(--border)] max-h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="p-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <div key={item.id}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                        isActive(item)
                          ? 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'
                          : 'text-[var(--foreground-muted)]'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  ) : (
                    <div className="space-y-1">
                      <div className="flex items-center gap-3 px-4 py-2 text-[var(--foreground-muted)]">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 pl-12 text-sm text-[var(--foreground-muted)] hover:text-white"
                        >
                          <child.icon className="w-4 h-4" />
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
