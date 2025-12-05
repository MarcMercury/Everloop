'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ChevronLeft,
  Award,
  BookOpen,
  MapPin,
  Users,
  Star,
  Calendar,
  TrendingUp,
  Crown,
  Sparkles,
  Heart,
  Share2,
  Settings,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  reputation_score: number;
  lore_title?: string;
  follower_count: number;
  following_count: number;
  specializations: string[];
  created_at: string;
  role: string;
}

interface ContributionStats {
  stories_written: number;
  stories_approved: number;
  characters_created: number;
  locations_created: number;
  lore_entries_created: number;
  total_word_count: number;
  events_participated: number;
  events_won: number;
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: string;
  earned_at: string;
}

interface Story {
  id: string;
  title: string;
  synopsis?: string;
  word_count: number;
  created_at: string;
  status: string;
}

export default function CreatorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<ContributionStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState<'stories' | 'characters' | 'locations' | 'badges'>('stories');

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      
      // Check if this is the current user's profile
      const { data: { user } } = await supabase.auth.getUser();
      setIsOwnProfile(user?.id === userId);
      
      // Check if following
      if (user && user.id !== userId) {
        const { data: followData } = await supabase
          .from('user_follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', userId)
          .single();
        setIsFollowing(!!followData);
      }
      
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError || !profileData) {
        router.push('/explore');
        return;
      }
      
      setProfile(profileData);
      
      // Load contribution stats
      const { data: statsData } = await supabase
        .from('contribution_stats')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (statsData) {
        setStats(statsData);
      }
      
      // Load badges
      const { data: badgesData } = await supabase
        .from('user_badges')
        .select(`
          earned_at,
          badges (id, name, description, icon, rarity)
        `)
        .eq('user_id', userId)
        .eq('is_displayed', true);
      
      if (badgesData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setBadges(badgesData.map((b: any) => ({
          ...b.badges,
          earned_at: b.earned_at
        })));
      }
      
      // Load stories
      const { data: storiesData } = await supabase
        .from('stories')
        .select('id, title, synopsis, word_count, created_at, status')
        .eq('author_id', userId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (storiesData) {
        setStories(storiesData);
      }
      
      setLoading(false);
    }
    
    loadProfile();
  }, [userId, router]);

  const handleFollow = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    if (isFollowing) {
      await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      setIsFollowing(false);
      if (profile) {
        setProfile({ ...profile, follower_count: profile.follower_count - 1 });
      }
    } else {
      await supabase
        .from('user_follows')
        .insert({ follower_id: user.id, following_id: userId });
      setIsFollowing(true);
      if (profile) {
        setProfile({ ...profile, follower_count: profile.follower_count + 1 });
      }
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'from-yellow-400 to-orange-500';
      case 'epic': return 'from-purple-400 to-purple-600';
      case 'rare': return 'from-blue-400 to-blue-600';
      case 'uncommon': return 'from-green-400 to-green-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--accent-gold)]" />
          <p className="text-[var(--foreground-muted)]">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <div className="bg-gradient-to-b from-[var(--accent-purple)]/20 to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/explore" 
            className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Explore
          </Link>
          
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-purple)] flex items-center justify-center text-4xl font-serif font-bold text-white">
                {profile.display_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              {profile.role === 'superadmin' && (
                <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-[var(--accent-gold)] rounded-full flex items-center justify-center">
                  <Crown className="w-6 h-6 text-black" />
                </div>
              )}
            </div>
            
            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-serif font-bold">{profile.display_name}</h1>
                {profile.lore_title && (
                  <span className="px-3 py-1 bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] rounded-full text-sm font-medium">
                    {profile.lore_title}
                  </span>
                )}
              </div>
              
              {profile.bio && (
                <p className="text-[var(--foreground-muted)] mb-4 max-w-2xl">{profile.bio}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-[var(--accent-gold)]" />
                  <span className="font-medium">{profile.reputation_score.toLocaleString()}</span>
                  <span className="text-[var(--foreground-muted)]">reputation</span>
                </div>
                
                <button className="flex items-center gap-2 hover:text-[var(--accent-blue)] transition-colors">
                  <Users className="w-5 h-5" />
                  <span className="font-medium">{profile.follower_count.toLocaleString()}</span>
                  <span className="text-[var(--foreground-muted)]">followers</span>
                </button>
                
                <button className="flex items-center gap-2 hover:text-[var(--accent-blue)] transition-colors">
                  <span className="font-medium">{profile.following_count.toLocaleString()}</span>
                  <span className="text-[var(--foreground-muted)]">following</span>
                </button>
                
                <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                  <Calendar className="w-5 h-5" />
                  <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-3">
              {isOwnProfile ? (
                <Link href="/settings" className="btn-secondary flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Link>
              ) : (
                <button 
                  onClick={handleFollow}
                  className={`flex items-center gap-2 ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              <button className="btn-secondary p-2">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      {stats && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <BookOpen className="w-6 h-6 text-[var(--accent-blue)] mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.stories_approved}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Stories</p>
            </div>
            <div className="card text-center">
              <Users className="w-6 h-6 text-[var(--accent-gold)] mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.characters_created}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Characters</p>
            </div>
            <div className="card text-center">
              <MapPin className="w-6 h-6 text-[var(--accent-purple)] mx-auto mb-2" />
              <p className="text-2xl font-bold">{stats.locations_created}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Locations</p>
            </div>
            <div className="card text-center">
              <TrendingUp className="w-6 h-6 text-[var(--success)] mx-auto mb-2" />
              <p className="text-2xl font-bold">{(stats.total_word_count / 1000).toFixed(1)}k</p>
              <p className="text-sm text-[var(--foreground-muted)]">Words</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Badges */}
      {badges.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <h2 className="text-xl font-serif font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-[var(--accent-gold)]" />
            Badges Earned
          </h2>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`group relative px-4 py-2 rounded-lg bg-gradient-to-r ${getRarityColor(badge.rarity)} text-white cursor-help`}
              >
                <span className="mr-2">{badge.icon}</span>
                <span className="font-medium">{badge.name}</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  <p className="text-sm">{badge.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Earned {new Date(badge.earned_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Content Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-12">
        <div className="flex gap-1 border-b border-[var(--border)] mb-6">
          {(['stories', 'characters', 'locations', 'badges'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'text-[var(--accent-gold)] border-b-2 border-[var(--accent-gold)]'
                  : 'text-[var(--foreground-muted)] hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        
        {/* Stories Tab */}
        {activeTab === 'stories' && (
          <div className="space-y-4">
            {stories.length === 0 ? (
              <div className="text-center py-12 text-[var(--foreground-muted)]">
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No published stories yet</p>
              </div>
            ) : (
              stories.map((story) => (
                <Link
                  key={story.id}
                  href={`/story/${story.id}`}
                  className="block card hover:border-[var(--accent-gold)] transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-serif font-semibold group-hover:text-[var(--accent-gold)] transition-colors">
                        {story.title}
                      </h3>
                      {story.synopsis && (
                        <p className="text-[var(--foreground-muted)] mt-2 line-clamp-2">{story.synopsis}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3 text-sm text-[var(--foreground-muted)]">
                        <span>{story.word_count.toLocaleString()} words</span>
                        <span>{new Date(story.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <ExternalLink className="w-5 h-5 text-[var(--foreground-muted)] group-hover:text-[var(--accent-gold)] transition-colors" />
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
        
        {/* Other tabs - placeholder */}
        {activeTab !== 'stories' && (
          <div className="text-center py-12 text-[var(--foreground-muted)]">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
