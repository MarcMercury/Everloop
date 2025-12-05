'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Compass,
  BookOpen,
  FileText,
  GitBranch,
  Search,
  Filter,
  Clock,
  User,
  ChevronRight,
  Layers,
  MapPin,
  X,
  Star,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Story, Arc, Location, TimePeriod, StoryWithMetadata } from '@/types/database';

export default function ExplorePage() {
  const [stories, setStories] = useState<StoryWithMetadata[]>([]);
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedArc, setSelectedArc] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      
      // Load approved stories with author info
      const { data: storiesData } = await supabase
        .from('stories')
        .select(`
          *,
          profiles:author_id (display_name),
          story_metadata (*)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (storiesData) {
        setStories(storiesData as unknown as StoryWithMetadata[]);
      }

      // Load canon data for filters
      const [arcsRes, locationsRes, periodsRes] = await Promise.all([
        supabase.from('arcs').select('*').order('name'),
        supabase.from('locations').select('*').order('name'),
        supabase.from('time_periods').select('*').order('chronological_order'),
      ]);

      if (arcsRes.data) setArcs(arcsRes.data);
      if (locationsRes.data) setLocations(locationsRes.data);
      if (periodsRes.data) setTimePeriods(periodsRes.data);
      
      setLoading(false);
    }

    loadData();
  }, []);

  const filteredStories = stories.filter(story => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = story.title.toLowerCase().includes(query);
      const matchesSynopsis = story.synopsis?.toLowerCase().includes(query);
      const matchesAuthor = story.profiles?.display_name?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesSynopsis && !matchesAuthor) return false;
    }

    // Type filter
    if (selectedType && story.type !== selectedType) return false;

    // Arc filter
    if (selectedArc && story.story_metadata) {
      if (!story.story_metadata.arc_ids?.includes(selectedArc)) return false;
    }

    // Location filter
    if (selectedLocation && story.story_metadata) {
      if (!story.story_metadata.location_ids?.includes(selectedLocation)) return false;
    }

    // Period filter
    if (selectedPeriod && story.story_metadata) {
      if (story.story_metadata.time_period_id !== selectedPeriod) return false;
    }

    return true;
  });

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

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType(null);
    setSelectedArc(null);
    setSelectedLocation(null);
    setSelectedPeriod(null);
  };

  const hasActiveFilters = searchQuery || selectedType || selectedArc || selectedLocation || selectedPeriod;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] constellation-bg">
      {/* Header */}
      <header className="py-12 px-4 sm:px-6 lg:px-8 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Compass className="w-8 h-8 text-[var(--accent-gold)]" />
            <h1 className="text-4xl font-serif font-bold">Explore the World</h1>
          </div>
          <p className="text-xl text-[var(--foreground-muted)] max-w-2xl">
            Browse approved stories from the Everloop canon. Each tale has been reviewed for consistency with the universe&apos;s lore and rules.
          </p>
        </div>
      </header>

      {/* Filters & Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search & Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories, authors..."
                className="pl-10 w-full"
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center gap-2 ${showFilters ? 'bg-[var(--background-tertiary)]' : ''}`}
            >
              <Filter className="w-5 h-5" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)]" />
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Filter Stories</span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[var(--accent-gold)] hover:underline flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Clear all
                  </button>
                )}
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Type Filter */}
                <div>
                  <label className="block text-xs text-[var(--foreground-muted)] mb-2">Story Type</label>
                  <select
                    value={selectedType || ''}
                    onChange={(e) => setSelectedType(e.target.value || null)}
                    className="w-full"
                  >
                    <option value="">All Types</option>
                    <option value="short">Short-Form</option>
                    <option value="long">Long-Form</option>
                    <option value="branch">Branch</option>
                  </select>
                </div>

                {/* Arc Filter */}
                <div>
                  <label className="block text-xs text-[var(--foreground-muted)] mb-2">Story Arc</label>
                  <select
                    value={selectedArc || ''}
                    onChange={(e) => setSelectedArc(e.target.value || null)}
                    className="w-full"
                  >
                    <option value="">All Arcs</option>
                    {arcs.map(arc => (
                      <option key={arc.id} value={arc.id}>{arc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-xs text-[var(--foreground-muted)] mb-2">Location</label>
                  <select
                    value={selectedLocation || ''}
                    onChange={(e) => setSelectedLocation(e.target.value || null)}
                    className="w-full"
                  >
                    <option value="">All Locations</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Time Period Filter */}
                <div>
                  <label className="block text-xs text-[var(--foreground-muted)] mb-2">Time Period</label>
                  <select
                    value={selectedPeriod || ''}
                    onChange={(e) => setSelectedPeriod(e.target.value || null)}
                    className="w-full"
                  >
                    <option value="">All Periods</option>
                    {timePeriods.map(period => (
                      <option key={period.id} value={period.id}>{period.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6 text-[var(--foreground-muted)]">
          {loading ? (
            <span>Loading stories...</span>
          ) : (
            <span>{filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'} found</span>
          )}
        </div>

        {/* Stories Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-[var(--background-tertiary)] rounded w-1/3 mb-4" />
                <div className="h-6 bg-[var(--background-tertiary)] rounded w-3/4 mb-2" />
                <div className="h-4 bg-[var(--background-tertiary)] rounded w-full mb-2" />
                <div className="h-4 bg-[var(--background-tertiary)] rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredStories.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 mx-auto text-[var(--foreground-muted)] mb-4" />
            <h2 className="text-xl font-serif font-semibold mb-2">No Stories Found</h2>
            <p className="text-[var(--foreground-muted)] mb-6">
              {hasActiveFilters
                ? 'Try adjusting your filters to find more stories.'
                : 'Be the first to contribute a story to the Everloop canon!'}
            </p>
            {hasActiveFilters ? (
              <button onClick={clearFilters} className="btn-secondary">
                Clear Filters
              </button>
            ) : (
              <Link href="/auth/signup" className="btn-primary inline-flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Start Writing
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStories.map((story) => (
              <Link
                key={story.id}
                href={`/story/${story.id}`}
                className="card group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 text-[var(--foreground-muted)]">
                    {getTypeIcon(story.type)}
                    <span className="text-xs capitalize">{story.type}-form</span>
                  </div>
                  <span className="badge badge-approved">Canon</span>
                </div>
                
                <h3 className="text-lg font-serif font-semibold mb-2 group-hover:text-[var(--accent-gold)] transition-colors">
                  {story.title}
                </h3>
                
                {story.synopsis && (
                  <p className="text-sm text-[var(--foreground-muted)] line-clamp-3 mb-4">
                    {story.synopsis}
                  </p>
                )}

                {/* Metadata tags */}
                {story.story_metadata && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {story.story_metadata.arc_ids?.slice(0, 2).map(arcId => {
                      const arc = arcs.find(a => a.id === arcId);
                      return arc ? (
                        <span key={arcId} className="text-xs px-2 py-1 rounded-full bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]">
                          <Layers className="w-3 h-3 inline mr-1" />
                          {arc.name}
                        </span>
                      ) : null;
                    })}
                    {story.story_metadata.location_ids?.slice(0, 1).map(locId => {
                      const loc = locations.find(l => l.id === locId);
                      return loc ? (
                        <span key={locId} className="text-xs px-2 py-1 rounded-full bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {loc.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)] pt-4 border-t border-[var(--border)]">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {story.is_canon && !story.author_id ? 'Marc Mercury' : (story.profiles?.display_name || 'Anonymous')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(story.created_at).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)] mt-12">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-[var(--foreground-muted)]">
            Want to contribute to the Everloop canon?{' '}
            <Link href="/auth/signup" className="text-[var(--accent-gold)] hover:underline">
              Start writing today
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
