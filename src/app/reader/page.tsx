'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Book,
  Map,
  Users,
  Compass,
  Heart,
  Bookmark,
  ChevronRight,
  Sparkles,
  Star,
  Clock,
  BookOpen,
  Eye,
  TrendingUp,
  Award,
  Search,
  Filter
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Story {
  id: string;
  title: string;
  synopsis?: string;
  word_count: number;
  created_at: string;
  author: {
    display_name: string;
    id: string;
  };
}

interface Character {
  id: string;
  name: string;
  description?: string;
  status?: string;
}

interface Location {
  id: string;
  name: string;
  region?: string;
  description?: string;
}

interface LoreEntry {
  id: string;
  title: string;
  category: string;
  content: string;
}

export default function ReaderPage() {
  const [activeTab, setActiveTab] = useState<'stories' | 'characters' | 'locations' | 'lore'>('stories');
  const [stories, setStories] = useState<Story[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loreEntries, setLoreEntries] = useState<LoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'wordcount'>('newest');

  useEffect(() => {
    async function loadContent() {
      const supabase = createClient();
      
      // Load stories with author info
      const { data: storiesData } = await supabase
        .from('stories')
        .select(`
          id, title, synopsis, word_count, created_at,
          profiles!author_id (id, display_name)
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (storiesData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setStories(storiesData.map((s: any) => ({
          ...s,
          author: s.profiles
        })));
      }
      
      // Load characters
      const { data: charactersData } = await supabase
        .from('characters')
        .select('*')
        .order('name')
        .limit(30);
      
      if (charactersData) {
        setCharacters(charactersData);
      }
      
      // Load locations
      const { data: locationsData } = await supabase
        .from('locations')
        .select('*')
        .order('name')
        .limit(30);
      
      if (locationsData) {
        setLocations(locationsData);
      }
      
      // Load lore entries
      const { data: loreData } = await supabase
        .from('lore_entries')
        .select('*')
        .eq('is_canon', true)
        .order('title')
        .limit(30);
      
      if (loreData) {
        setLoreEntries(loreData);
      }
      
      setLoading(false);
    }
    
    loadContent();
  }, []);

  const tabs = [
    { id: 'stories', label: 'Stories', icon: Book, count: stories.length },
    { id: 'characters', label: 'Characters', icon: Users, count: characters.length },
    { id: 'locations', label: 'Locations', icon: Map, count: locations.length },
    { id: 'lore', label: 'Lore', icon: Compass, count: loreEntries.length },
  ];

  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.synopsis?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCharacters = characters.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLore = loreEntries.filter(l =>
    l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Sparkles className="w-8 h-8 animate-pulse text-[var(--accent-gold)]" />
          <p className="text-[var(--foreground-muted)]">Loading the Everloop...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-[var(--accent-blue)]/20 via-[var(--accent-purple)]/10 to-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Eye className="w-8 h-8 text-[var(--accent-gold)]" />
            <h1 className="text-4xl font-serif font-bold">Reader Mode</h1>
          </div>
          <p className="text-xl text-[var(--foreground-muted)] max-w-2xl mx-auto mb-8">
            Explore the Everloop universe without writing. Browse stories, discover characters, 
            and collect lore fragments as you journey through this broken world.
          </p>
          
          {/* Quick Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--accent-blue)]">{stories.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Stories</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--accent-gold)]">{characters.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Characters</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--accent-purple)]">{locations.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Locations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[var(--success)]">{loreEntries.length}</p>
              <p className="text-sm text-[var(--foreground-muted)]">Lore Entries</p>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories, characters, locations..."
              className="w-full pl-12 pr-4 py-3 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 border-b border-[var(--border)]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-[var(--accent-gold)] border-b-2 border-[var(--accent-gold)]'
                  : 'text-[var(--foreground-muted)] hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className="px-2 py-0.5 bg-[var(--background-tertiary)] rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Stories Grid */}
        {activeTab === 'stories' && (
          <div className="py-8">
            {/* Sort Options */}
            <div className="flex items-center gap-4 mb-6">
              <Filter className="w-4 h-4 text-[var(--foreground-muted)]" />
              {(['newest', 'popular', 'wordcount'] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => setSortBy(sort)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    sortBy === sort
                      ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]'
                      : 'text-[var(--foreground-muted)] hover:text-white'
                  }`}
                >
                  {sort === 'newest' && 'Newest'}
                  {sort === 'popular' && 'Popular'}
                  {sort === 'wordcount' && 'Longest'}
                </button>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {filteredStories.map((story) => (
                <Link
                  key={story.id}
                  href={`/story/${story.id}`}
                  className="card group hover:border-[var(--accent-gold)] transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-serif font-semibold group-hover:text-[var(--accent-gold)] transition-colors">
                      {story.title}
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.preventDefault(); }}
                        className="p-1.5 text-[var(--foreground-muted)] hover:text-[var(--accent-gold)] transition-colors"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={(e) => { e.preventDefault(); }}
                        className="p-1.5 text-[var(--foreground-muted)] hover:text-red-400 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {story.synopsis && (
                    <p className="text-sm text-[var(--foreground-muted)] mb-4 line-clamp-2">
                      {story.synopsis}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                    <Link 
                      href={`/creator/${story.author.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="hover:text-[var(--accent-blue)]"
                    >
                      by {story.author.display_name}
                    </Link>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {story.word_count.toLocaleString()} words
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(story.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Characters Grid */}
        {activeTab === 'characters' && (
          <div className="py-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCharacters.map((character) => (
                <div
                  key={character.id}
                  className="card hover:border-[var(--accent-gold)] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-purple)] flex items-center justify-center text-lg font-serif font-bold text-white flex-shrink-0">
                      {character.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{character.name}</h3>
                      {character.status && (
                        <span className={`inline-flex text-xs px-2 py-0.5 rounded capitalize ${
                          character.status === 'active' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                          character.status === 'deceased' ? 'bg-gray-500/20 text-gray-400' :
                          character.status === 'legendary' ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]' :
                          'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]'
                        }`}>
                          {character.status}
                        </span>
                      )}
                      {character.description && (
                        <p className="text-sm text-[var(--foreground-muted)] mt-2 line-clamp-2">
                          {character.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locations Grid */}
        {activeTab === 'locations' && (
          <div className="py-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLocations.map((location) => (
                <div
                  key={location.id}
                  className="card hover:border-[var(--accent-purple)] transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center flex-shrink-0">
                      <Map className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-1">{location.name}</h3>
                      {location.region && (
                        <p className="text-xs text-[var(--accent-purple)] mb-2">{location.region}</p>
                      )}
                      {location.description && (
                        <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">
                          {location.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Lore Grid */}
        {activeTab === 'lore' && (
          <div className="py-8">
            <div className="grid md:grid-cols-2 gap-6">
              {filteredLore.map((entry) => (
                <div
                  key={entry.id}
                  className="card hover:border-[var(--success)] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-2 py-0.5 text-xs rounded capitalize ${
                      entry.category === 'concept' ? 'bg-blue-500/20 text-blue-400' :
                      entry.category === 'event' ? 'bg-orange-500/20 text-orange-400' :
                      entry.category === 'faction' ? 'bg-purple-500/20 text-purple-400' :
                      entry.category === 'artifact' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {entry.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-semibold mb-2">{entry.title}</h3>
                  <p className="text-sm text-[var(--foreground-muted)] line-clamp-4">
                    {entry.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty States */}
        {activeTab === 'stories' && filteredStories.length === 0 && (
          <div className="text-center py-16">
            <Book className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-muted)] opacity-50" />
            <p className="text-[var(--foreground-muted)]">No stories found</p>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card bg-gradient-to-r from-[var(--accent-gold)]/10 to-[var(--accent-purple)]/10 border-[var(--accent-gold)]/30 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-[var(--accent-gold)]" />
          <h2 className="text-2xl font-serif font-bold mb-3">Ready to Contribute?</h2>
          <p className="text-[var(--foreground-muted)] mb-6 max-w-lg mx-auto">
            Switch from reader to creator. Write your own stories, create characters, 
            and help shape the Everloop universe.
          </p>
          <Link href="/story/new" className="btn-primary inline-flex items-center gap-2">
            Start Writing
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
