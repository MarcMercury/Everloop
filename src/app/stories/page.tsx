'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import {
  BookOpen,
  Sparkles,
  Clock,
  TrendingUp,
  Plus,
  ChevronRight,
  Users,
  Star,
  BookMarked,
  Eye,
  Edit3,
} from 'lucide-react';

interface Story {
  id: string;
  title: string;
  synopsis: string;
  status: 'draft' | 'published' | 'in_progress';
  is_canon: boolean;
  word_count: number;
  created_at: string;
  updated_at: string;
  author_id: string | null;
  profiles?: {
    display_name: string | null;
    username: string;
  };
}

interface StorySection {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  stories: Story[];
  link?: string;
  linkText?: string;
  emptyMessage: string;
}

export default function StoriesPage() {
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [canonStories, setCanonStories] = useState<Story[]>([]);
  const [recentStories, setRecentStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      // Fetch user's own stories
      if (user) {
        const { data: myData } = await supabase
          .from('stories')
          .select('*')
          .eq('author_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(6);
        setMyStories(myData || []);
      }

      // Fetch canon stories
      const { data: canonData } = await supabase
        .from('stories')
        .select(`*, profiles:author_id(display_name, username)`)
        .eq('is_canon', true)
        .order('created_at', { ascending: true })
        .limit(6);
      setCanonStories(canonData || []);

      // Fetch recent community stories
      const { data: recentData } = await supabase
        .from('stories')
        .select(`*, profiles:author_id(display_name, username)`)
        .eq('status', 'published')
        .eq('is_canon', false)
        .order('created_at', { ascending: false })
        .limit(6);
      setRecentStories(recentData || []);

      setLoading(false);
    };

    fetchData();
  }, [supabase]);

  const getAuthorName = (story: Story) => {
    if (story.is_canon && !story.author_id) return 'Marc Mercury';
    if (story.profiles?.display_name) return story.profiles.display_name;
    if (story.profiles?.username) return story.profiles.username;
    return 'Anonymous';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const StoryCard = ({ story, showAuthor = true }: { story: Story; showAuthor?: boolean }) => (
    <Link
      href={`/story/${story.id}`}
      className="block p-4 bg-[var(--background)] rounded-xl border border-[var(--border)] hover:border-[var(--accent-gold)]/50 transition-all group"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-white group-hover:text-[var(--accent-gold)] transition-colors line-clamp-1">
          {story.title}
        </h3>
        {story.is_canon && (
          <span className="shrink-0 ml-2 px-2 py-0.5 bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] text-xs rounded-full flex items-center gap-1">
            <Star className="w-3 h-3" />
            Canon
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--foreground-muted)] line-clamp-2 mb-3">
        {story.synopsis || 'No synopsis available.'}
      </p>
      <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)]">
        {showAuthor && (
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {getAuthorName(story)}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(story.updated_at || story.created_at)}
        </span>
      </div>
    </Link>
  );

  const SectionHeader = ({ 
    icon: Icon, 
    title, 
    description,
    link,
    linkText,
  }: { 
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    link?: string;
    linkText?: string;
  }) => (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-gold)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[var(--accent-gold)]" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-sm text-[var(--foreground-muted)]">{description}</p>
        </div>
      </div>
      {link && (
        <Link
          href={link}
          className="flex items-center gap-1 text-sm text-[var(--accent-gold)] hover:underline"
        >
          {linkText || 'View all'}
          <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[var(--accent-gold)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Stories</h1>
            <p className="text-[var(--foreground-muted)]">
              Explore the tales of Everloop — from founding canon to community creations
            </p>
          </div>
          <Link
            href="/write"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-gold)] text-black font-medium rounded-lg hover:bg-[var(--accent-gold)]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Write a Story
          </Link>
        </div>

        {/* My Stories (if logged in) */}
        {userId && (
          <section className="mb-10">
            <SectionHeader
              icon={Edit3}
              title="My Stories"
              description="Your drafts and published works"
              link="/profile"
              linkText="Manage all"
            />
            {myStories.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myStories.map((story) => (
                  <StoryCard key={story.id} story={story} showAuthor={false} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)]">
                <BookOpen className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-3" />
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
          </section>
        )}

        {/* Canon Stories */}
        <section className="mb-10">
          <SectionHeader
            icon={Star}
            title="Founding Stories"
            description="The canonical tales that define the Everloop universe"
            link="/explore?filter=canon"
            linkText="Explore canon"
          />
          {canonStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {canonStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)]">
              <Sparkles className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-3" />
              <p className="text-[var(--foreground-muted)]">Canon stories coming soon</p>
            </div>
          )}
        </section>

        {/* Recent Community Stories */}
        <section className="mb-10">
          <SectionHeader
            icon={TrendingUp}
            title="Recent Stories"
            description="Fresh tales from the Everloop community"
            link="/explore"
            linkText="Discover more"
          />
          {recentStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentStories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)]">
              <Users className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-3" />
              <p className="text-[var(--foreground-muted)] mb-4">Be the first to publish a story!</p>
              <Link
                href="/write"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--accent-purple)] text-white font-medium rounded-lg hover:bg-[var(--accent-purple)]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Write Now
              </Link>
            </div>
          )}
        </section>

        {/* Quick Links */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/explore"
            className="p-6 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] hover:border-[var(--accent-blue)]/50 transition-all group"
          >
            <Eye className="w-8 h-8 text-[var(--accent-blue)] mb-3" />
            <h3 className="font-semibold text-white mb-1 group-hover:text-[var(--accent-blue)] transition-colors">
              Explore All Stories
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              Browse the complete library of Everloop tales
            </p>
          </Link>

          <Link
            href="/characters"
            className="p-6 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] hover:border-[var(--accent-purple)]/50 transition-all group"
          >
            <Users className="w-8 h-8 text-[var(--accent-purple)] mb-3" />
            <h3 className="font-semibold text-white mb-1 group-hover:text-[var(--accent-purple)] transition-colors">
              Meet the Characters
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              Discover the heroes, villains, and everyone between
            </p>
          </Link>

          <Link
            href="/lore"
            className="p-6 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] hover:border-[var(--accent-gold)]/50 transition-all group"
          >
            <BookMarked className="w-8 h-8 text-[var(--accent-gold)] mb-3" />
            <h3 className="font-semibold text-white mb-1 group-hover:text-[var(--accent-gold)] transition-colors">
              Lore Archive
            </h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              The living encyclopedia of Everloop knowledge
            </p>
          </Link>
        </section>
      </div>
    </div>
  );
}
