'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Search,
  Map,
  Sparkles,
  Filter,
  Clock,
  Eye,
  Globe
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MapItem {
  id: string;
  name: string;
  description: string;
  map_type: string;
  is_public: boolean;
  created_at: string;
  created_by: string;
}

const MAP_TYPE_ICONS: Record<string, string> = {
  world: '🌍',
  region: '🗺️',
  city: '🏙️',
  building: '🏛️',
  dungeon: '⚔️',
};

export default function MapsPage() {
  const router = useRouter();
  const [maps, setMaps] = useState<MapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all');

  useEffect(() => {
    async function loadMaps() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      let query = supabase
        .from('maps')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filter === 'public') {
        query = query.eq('is_public', true);
      } else if (filter === 'private') {
        query = query.eq('is_public', false).eq('created_by', user.id);
      }
      
      const { data } = await query;
      
      if (data) {
        setMaps(data);
      }
      
      setLoading(false);
    }
    
    loadMaps();
  }, [router, filter]);

  const filteredMaps = maps.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--gold)]">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--background-light)] border-b border-[var(--gold)]/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="text-[var(--foreground-muted)] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Map className="w-5 h-5 text-[var(--gold)]" />
              <h1 className="text-xl font-bold text-white">Maps</h1>
            </div>
          </div>
          
          <Link
            href="/maps/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-black rounded-lg font-medium hover:bg-[var(--gold-light)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Map
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search maps..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--background-light)] rounded-lg border border-[var(--gold)]/20 text-white focus:outline-none focus:border-[var(--gold)]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--foreground-muted)]" />
            {(['all', 'public', 'private'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filter === f
                    ? 'bg-[var(--gold)] text-black'
                    : 'bg-[var(--background-light)] text-[var(--foreground-muted)] hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Maps Grid */}
        {filteredMaps.length === 0 ? (
          <div className="text-center py-16">
            <Map className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Maps Found</h2>
            <p className="text-[var(--foreground-muted)] mb-6">
              {filter === 'all' 
                ? 'Create your first map to visualize Everloop'
                : filter === 'public'
                ? 'No public maps available'
                : 'You haven\'t created any private maps'}
            </p>
            <Link
              href="/maps/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-black rounded-lg font-medium hover:bg-[var(--gold-light)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Map
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaps.map((map) => (
              <Link
                key={map.id}
                href={`/maps/${map.id}`}
                className="group p-6 bg-[var(--background-light)] rounded-xl border border-[var(--gold)]/10 hover:border-[var(--gold)]/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center text-2xl">
                    {MAP_TYPE_ICONS[map.map_type] || '🗺️'}
                  </div>
                  <div className="flex items-center gap-2">
                    {map.is_public ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                        <Globe className="w-3 h-3" />
                        Public
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-500/20 text-gray-400 text-xs rounded-full">
                        <Eye className="w-3 h-3" />
                        Private
                      </span>
                    )}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white group-hover:text-[var(--gold)] transition-colors mb-2">
                  {map.name}
                </h3>
                <p className="text-sm text-[var(--foreground-muted)] line-clamp-3 mb-4">
                  {map.description || 'No description yet...'}
                </p>
                
                <div className="flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(map.created_at).toLocaleDateString()}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
