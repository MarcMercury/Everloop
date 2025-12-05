'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  PenTool, 
  BookOpen, 
  FileText, 
  GitBranch, 
  Compass,
  LogOut,
  Settings,
  User,
  Clock,
  CheckCircle,
  Map,
  Swords,
  ScrollText,
  Users,
  Feather,
  RefreshCw,
  Link2,
  Layers,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Profile, Story } from '@/types/database';
import OnboardingModal from '@/components/OnboardingModal';

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        if (!profileData.has_accepted_rules) {
          setShowOnboarding(true);
        }
      }

      // Get user's stories
      const { data: storiesData } = await supabase
        .from('stories')
        .select('*')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false });

      if (storiesData) {
        setStories(storiesData);
      }

      setLoading(false);
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleAcceptRules = async () => {
    if (!profile) return;
    
    const supabase = createClient();
    await supabase
      .from('profiles')
      .update({ has_accepted_rules: true })
      .eq('id', profile.id);

    setProfile({ ...profile, has_accepted_rules: true });
    setShowOnboarding(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="badge badge-draft">Draft</span>;
      case 'in_review':
        return <span className="badge badge-review">In Review</span>;
      case 'changes_requested':
        return <span className="badge badge-changes">Changes Requested</span>;
      case 'approved':
        return <span className="badge badge-approved">Approved</span>;
      default:
        return <span className="badge badge-draft">{status}</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'short':
        return <FileText className="w-4 h-4" />;
      case 'long':
        return <BookOpen className="w-4 h-4" />;
      case 'branch':
        return <GitBranch className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[var(--accent-gold)]" />
          <span className="text-[var(--foreground-muted)]">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] constellation-bg">
      {showOnboarding && (
        <OnboardingModal onAccept={handleAcceptRules} />
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-semibold font-serif">Everloop</span>
              </Link>
              <div className="hidden md:flex items-center gap-4">
                <Link href="/dashboard" className="text-white font-medium">Dashboard</Link>
                <Link href="/desk" className="text-[var(--foreground-muted)] hover:text-white transition-colors">Story Desk</Link>
                <Link href="/write" className="text-[var(--foreground-muted)] hover:text-white transition-colors">Writing Studio</Link>
                <Link href="/explore" className="text-[var(--foreground-muted)] hover:text-white transition-colors">Explore</Link>
                <Link href="/lore" className="text-[var(--foreground-muted)] hover:text-white transition-colors">LoreForge</Link>
                <Link href="/paths" className="text-[var(--foreground-muted)] hover:text-white transition-colors">Story Paths</Link>
                {profile?.role === 'admin' && (
                  <Link href="/admin" className="text-[var(--foreground-muted)] hover:text-white transition-colors">Admin</Link>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
                <User className="w-4 h-4" />
                <span>{profile?.display_name || profile?.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="text-[var(--foreground-muted)] hover:text-white transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold mb-2">Your Stories</h1>
            <p className="text-[var(--foreground-muted)]">
              Manage your contributions to the Everloop universe
            </p>
          </div>
          <Link href="/write" className="btn-primary flex items-center gap-2">
            <Feather className="w-5 h-5" />
            Open Writing Studio
          </Link>
        </div>

        {/* Stories Grid */}
        {stories.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-[var(--background-secondary)] flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-[var(--foreground-muted)]" />
            </div>
            <h2 className="text-xl font-serif font-semibold mb-2">No Stories Yet</h2>
            <p className="text-[var(--foreground-muted)] mb-6 max-w-md mx-auto">
              You haven&apos;t started any stories. Begin your journey into the Everloop universe.
            </p>
            <Link href="/story/new" className="btn-primary inline-flex items-center gap-2">
              <PenTool className="w-5 h-5" />
              Start Your First Story
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/editor/${story.id}`}
                className="card group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                    {getTypeIcon(story.type)}
                    <span className="text-sm capitalize">{story.type}-form</span>
                  </div>
                  {getStatusBadge(story.status)}
                </div>
                <h3 className="text-lg font-serif font-semibold mb-2 group-hover:text-[var(--accent-gold)] transition-colors">
                  {story.title || 'Untitled Story'}
                </h3>
                {story.synopsis && (
                  <p className="text-sm text-[var(--foreground-muted)] line-clamp-2 mb-4">
                    {story.synopsis}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                  <span>{story.word_count.toLocaleString()} words</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(story.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-[var(--border)]">
          <h2 className="text-xl font-serif font-semibold mb-6">Creative Tools</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/desk" className="card flex items-center gap-4 group bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Story Desk</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Unified dashboard</p>
              </div>
            </Link>
            <Link href="/write" className="card flex items-center gap-4 group bg-gradient-to-br from-[var(--accent-purple)]/10 to-[var(--accent-blue)]/10 border-[var(--accent-purple)]/30">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Feather className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold">Writing Studio</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Full writing suite</p>
              </div>
            </Link>
            <Link href="/maps/new" className="card flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Map className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Map Lab</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Create world maps</p>
              </div>
            </Link>
            <Link href="/quests/new" className="card flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Swords className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold">Quest Builder</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Design interactive quests</p>
              </div>
            </Link>
          </div>
        </div>

        {/* World Building Tools */}
        <div className="mt-8">
          <h2 className="text-xl font-serif font-semibold mb-6">World Building</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/lore" className="card flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ScrollText className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">LoreForge</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Browse the encyclopedia</p>
              </div>
            </Link>
            <Link href="/characters/new" className="card flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Character Designer</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Create characters & creatures</p>
              </div>
            </Link>
            <Link href="/paths" className="card flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <GitBranch className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <h3 className="font-semibold">Story Paths</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Track canon connections</p>
              </div>
            </Link>
            <Link href="/simulator" className="card flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <RefreshCw className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold">Fray Simulator</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Visualize instabilities</p>
              </div>
            </Link>
          </div>
        </div>

        {/* More Quick Links */}
        <div className="mt-8">
          <h2 className="text-xl font-serif font-semibold mb-6">Quick Links</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/explore" className="card flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent-blue)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6 text-[var(--accent-blue)]" />
              </div>
              <div>
                <h3 className="font-semibold">Explore Canon</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Browse approved stories</p>
              </div>
            </Link>
            <Link href="/story/new" className="card flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-[var(--accent-purple)]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <PenTool className="w-6 h-6 text-[var(--accent-purple)]" />
              </div>
              <div>
                <h3 className="font-semibold">New Story</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Start a new contribution</p>
              </div>
            </Link>
            <Link href="/contracts" className="card flex items-center gap-4 group">
              <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Link2 className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h3 className="font-semibold">Contracts</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Collaboration agreements</p>
              </div>
            </Link>
            <Link href="/settings" className="card flex items-center gap-4 group opacity-60">
              <div className="w-12 h-12 rounded-lg bg-[var(--success)]/20 flex items-center justify-center">
                <Settings className="w-6 h-6 text-[var(--success)]" />
              </div>
              <div>
                <h3 className="font-semibold">Settings</h3>
                <p className="text-sm text-[var(--foreground-muted)]">Coming soon</p>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
