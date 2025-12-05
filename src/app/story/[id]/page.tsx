'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowLeft,
  BookOpen,
  FileText,
  GitBranch,
  Clock,
  User,
  Layers,
  MapPin,
  Calendar,
  Share2,
  Bookmark,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Story, Arc, Location, TimePeriod, Character, StoryMetadata } from '@/types/database';

interface StoryDetails extends Story {
  profiles?: { display_name: string };
  story_metadata?: StoryMetadata;
}

export default function StoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;
  
  const [story, setStory] = useState<StoryDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Canon data
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod | null>(null);

  useEffect(() => {
    async function loadStory() {
      const supabase = createClient();
      
      // Load story
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select(`
          *,
          profiles:author_id (display_name),
          story_metadata (*)
        `)
        .eq('id', storyId)
        .single();

      if (storyError || !storyData) {
        setError('Story not found');
        setLoading(false);
        return;
      }

      setStory(storyData as unknown as StoryDetails);

      // Load related canon data
      const metadata = storyData.story_metadata?.[0] || storyData.story_metadata;
      
      if (metadata) {
        // Load arcs
        if (metadata.arc_ids?.length) {
          const { data: arcsData } = await supabase.from('arcs').select('*').in('id', metadata.arc_ids);
          if (arcsData) setArcs(arcsData);
        }
        
        // Load locations
        if (metadata.location_ids?.length) {
          const { data: locationsData } = await supabase.from('locations').select('*').in('id', metadata.location_ids);
          if (locationsData) setLocations(locationsData);
        }
        
        // Load characters
        if (metadata.character_ids?.length) {
          const { data: charactersData } = await supabase.from('characters').select('*').in('id', metadata.character_ids);
          if (charactersData) setCharacters(charactersData);
        }
        
        // Load time period
        if (metadata.time_period_id) {
          const { data: periodData } = await supabase.from('time_periods').select('*').eq('id', metadata.time_period_id).single();
          if (periodData) setTimePeriod(periodData);
        }
      }
      
      setLoading(false);
    }

    loadStory();
  }, [storyId]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'short':
        return <FileText className="w-5 h-5" />;
      case 'long':
        return <BookOpen className="w-5 h-5" />;
      case 'branch':
        return <GitBranch className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'short':
        return 'Short-Form Story';
      case 'long':
        return 'Long-Form Novel';
      case 'branch':
        return 'Branch Continuation';
      default:
        return 'Story';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] constellation-bg flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] mx-auto mb-4 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-[var(--foreground-muted)]">Loading story...</p>
        </div>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div className="min-h-screen bg-[var(--background)] constellation-bg flex items-center justify-center">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 text-[var(--foreground-muted)] mx-auto mb-4" />
          <h1 className="text-2xl font-serif font-bold mb-2">Story Not Found</h1>
          <p className="text-[var(--foreground-muted)] mb-6">
            This story may have been removed or doesn&apos;t exist.
          </p>
          <Link href="/explore" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Back to Explore
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] constellation-bg">
      {/* Sub-header with actions */}
      <div className="bg-[var(--background-secondary)] border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-12">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors text-[var(--foreground-muted)] hover:text-white">
                <Bookmark className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg hover:bg-[var(--background)] transition-colors text-[var(--foreground-muted)] hover:text-white">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Story Header */}
      <header className="py-12 px-4 sm:px-6 lg:px-8 border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
              {getTypeIcon(story.type)}
              <span className="text-sm">{getTypeLabel(story.type)}</span>
            </div>
            {story.status === 'approved' && (
              <span className="badge badge-approved">Canon</span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4">
            {story.title}
          </h1>

          {/* Synopsis */}
          {story.synopsis && (
            <p className="text-xl text-[var(--foreground-muted)] mb-6">
              {story.synopsis}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--foreground-muted)]">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {story.is_canon && !story.author_id ? 'Marc Mercury' : (story.profiles?.display_name || 'Anonymous')}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {Math.ceil((story.content?.length || 0) / 1000)} min read
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(story.created_at).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </header>

      {/* Content & Sidebar */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-[1fr,300px] gap-12">
          {/* Story Content */}
          <article className="prose prose-invert prose-lg max-w-none">
            <div 
              className="story-content"
              dangerouslySetInnerHTML={{ __html: story.content || '<p>No content available.</p>' }}
            />
          </article>

          {/* Sidebar - Canon Context */}
          <aside className="space-y-6">
            {/* Time Period */}
            {timePeriod && (
              <div className="card">
                <h3 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-3">
                  Time Period
                </h3>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[var(--accent-gold)] mt-0.5" />
                  <div>
                    <p className="font-medium">{timePeriod.name}</p>
                    {timePeriod.description && (
                      <p className="text-sm text-[var(--foreground-muted)] mt-1">
                        {timePeriod.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Story Arcs */}
            {arcs.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-3">
                  Story Arcs
                </h3>
                <div className="space-y-3">
                  {arcs.map(arc => (
                    <div key={arc.id} className="flex items-start gap-3">
                      <Layers className="w-5 h-5 text-[var(--accent-blue)] mt-0.5" />
                      <div>
                        <p className="font-medium">{arc.name}</p>
                        {arc.description && (
                          <p className="text-sm text-[var(--foreground-muted)] mt-1 line-clamp-2">
                            {arc.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locations */}
            {locations.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-3">
                  Locations
                </h3>
                <div className="space-y-3">
                  {locations.map(location => (
                    <div key={location.id} className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-[var(--accent-purple)] mt-0.5" />
                      <div>
                        <p className="font-medium">{location.name}</p>
                        {location.description && (
                          <p className="text-sm text-[var(--foreground-muted)] mt-1 line-clamp-2">
                            {location.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Characters */}
            {characters.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-3">
                  Featured Characters
                </h3>
                <div className="space-y-3">
                  {characters.map(character => (
                    <div key={character.id} className="flex items-start gap-3">
                      <User className="w-5 h-5 text-[var(--accent-gold)] mt-0.5" />
                      <div>
                        <p className="font-medium">{character.name}</p>
                        {character.description && (
                          <p className="text-sm text-[var(--foreground-muted)] mt-1 line-clamp-2">
                            {character.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Related Stories */}
            <div className="card">
              <h3 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-3">
                Explore More
              </h3>
              <Link 
                href="/explore"
                className="flex items-center justify-between text-[var(--accent-gold)] hover:underline"
              >
                <span>Browse all stories</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-serif font-semibold mb-4">
            Inspired to Contribute?
          </h2>
          <p className="text-[var(--foreground-muted)] mb-6">
            Join the Everloop community and add your voice to the canon.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Start Writing
            </Link>
            <Link href="/explore" className="btn-secondary">
              Keep Exploring
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
