'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  BookOpen,
  Star,
  Award,
  Clock,
  Edit3,
  Settings,
  TrendingUp,
  Calendar,
  FileText,
  Users,
  MapPin,
  ScrollText,
  ChevronRight,
  Plus,
  Crown,
  Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  has_accepted_rules: boolean;
  created_at: string;
  updated_at: string;
}

interface Story {
  id: string;
  title: string;
  status: string;
  is_canon: boolean;
  word_count: number;
  created_at: string;
  updated_at: string;
}

interface Contribution {
  id: string;
  type: 'character' | 'location' | 'lore';
  name: string;
  is_canon: boolean;
  created_at: string;
}

interface Stats {
  totalStories: number;
  canonStories: number;
  totalWords: number;
  contributions: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [stats, setStats] = useState<Stats>({ totalStories: 0, canonStories: 0, totalWords: 0, contributions: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stories' | 'contributions' | 'activity'>('stories');
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
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
      }

      // Get user's stories
      const { data: storiesData } = await supabase
        .from('stories')
        .select('id, title, status, is_canon, word_count, created_at, updated_at')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false });

      if (storiesData) {
        setStories(storiesData);
        const canonCount = storiesData.filter(s => s.is_canon).length;
        const totalWords = storiesData.reduce((sum, s) => sum + (s.word_count || 0), 0);
        setStats(prev => ({
          ...prev,
          totalStories: storiesData.length,
          canonStories: canonCount,
          totalWords: totalWords,
        }));
      }

      // Get contributions (characters, locations created by user)
      const [charactersRes, locationsRes, loreRes] = await Promise.all([
        supabase.from('characters').select('id, name, is_canon, created_at').eq('created_by', user.id),
        supabase.from('locations').select('id, name, is_canon, created_at').eq('created_by', user.id),
        supabase.from('lore_entries').select('id, title, is_canon, created_at').eq('created_by', user.id),
      ]);

      const allContributions: Contribution[] = [
        ...(charactersRes.data || []).map(c => ({ ...c, type: 'character' as const, name: c.name })),
        ...(locationsRes.data || []).map(l => ({ ...l, type: 'location' as const, name: l.name })),
        ...(loreRes.data || []).map(e => ({ ...e, type: 'lore' as const, name: e.title })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setContributions(allContributions);
      setStats(prev => ({ ...prev, contributions: allContributions.length }));

      setLoading(false);
    }

    loadProfile();
  }, [router, supabase]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-400/10';
      case 'pending_review': case 'in_review': return 'text-amber-400 bg-amber-400/10';
      case 'changes_requested': return 'text-orange-400 bg-orange-400/10';
      case 'rejected': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getContributionIcon = (type: string) => {
    switch (type) {
      case 'character': return Users;
      case 'location': return MapPin;
      case 'lore': return ScrollText;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[var(--accent-gold)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-[var(--background-secondary)] rounded-2xl border border-[var(--border)] p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-purple)] flex items-center justify-center text-3xl font-bold text-white">
              {profile?.display_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase() || 'U'}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">
                  {profile?.display_name || 'Anonymous Writer'}
                </h1>
                {profile?.role === 'admin' && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] text-xs rounded-full">
                    <Crown className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-[var(--foreground-muted)] text-sm mb-3">{profile?.email}</p>
              <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined {formatDate(profile?.created_at || '')}
                </span>
              </div>
            </div>

            {/* Edit Button */}
            <Link
              href="/settings"
              className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm hover:bg-[var(--background-tertiary)] transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-2">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm">Stories</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalStories}</p>
          </div>
          <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-2">
              <Star className="w-4 h-4 text-[var(--accent-gold)]" />
              <span className="text-sm">Canon</span>
            </div>
            <p className="text-2xl font-bold text-[var(--accent-gold)]">{stats.canonStories}</p>
          </div>
          <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-2">
              <Edit3 className="w-4 h-4" />
              <span className="text-sm">Words</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalWords.toLocaleString()}</p>
          </div>
          <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] p-4">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)] mb-2">
              <Award className="w-4 h-4 text-[var(--accent-purple)]" />
              <span className="text-sm">Contributions</span>
            </div>
            <p className="text-2xl font-bold text-[var(--accent-purple)]">{stats.contributions}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[var(--border)]">
          {[
            { id: 'stories', label: 'My Stories', icon: BookOpen },
            { id: 'contributions', label: 'Contributions', icon: Sparkles },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.id
                  ? 'border-[var(--accent-gold)] text-[var(--accent-gold)]'
                  : 'border-transparent text-[var(--foreground-muted)] hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activeTab === 'stories' && (
          <div className="space-y-4">
            {stories.length > 0 ? (
              stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/editor/${story.id}`}
                  className="block p-4 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] hover:border-[var(--accent-gold)]/50 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white group-hover:text-[var(--accent-gold)] transition-colors">
                          {story.title || 'Untitled'}
                        </h3>
                        {story.is_canon && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] text-xs rounded-full">
                            <Star className="w-3 h-3" />
                            Canon
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
                        <span>{story.word_count?.toLocaleString() || 0} words</span>
                        <span>Updated {formatDate(story.updated_at)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs capitalize ${getStatusColor(story.status)}`}>
                        {story.status.replace('_', ' ')}
                      </span>
                      <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
                <p className="text-[var(--foreground-muted)] mb-4">You haven't written any stories yet</p>
                <Link
                  href="/write"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-gold)] text-black font-medium rounded-lg hover:bg-[var(--accent-gold)]/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Start Writing
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contributions' && (
          <div className="space-y-4">
            {contributions.length > 0 ? (
              contributions.map((contrib) => {
                const Icon = getContributionIcon(contrib.type);
                return (
                  <div
                    key={`${contrib.type}-${contrib.id}`}
                    className="flex items-center gap-4 p-4 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)]"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[var(--background)] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[var(--foreground-muted)]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">{contrib.name}</h3>
                        {contrib.is_canon && (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] text-xs rounded-full">
                            <Star className="w-3 h-3" />
                            Canon
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)] capitalize">
                        {contrib.type} • Added {formatDate(contrib.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Award className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
                <p className="text-[var(--foreground-muted)] mb-4">No contributions yet</p>
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-purple)] text-white font-medium rounded-lg hover:bg-[var(--accent-purple)]/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Create Something
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
