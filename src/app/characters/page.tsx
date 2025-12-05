'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Search,
  Users,
  Sparkles,
  Filter,
  Crown,
  Swords,
  Heart,
  Skull,
  Star
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  role: string;
  status: string;
  is_canon: boolean;
  created_at: string;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  protagonist: <Star className="w-4 h-4 text-[var(--gold)]" />,
  antagonist: <Skull className="w-4 h-4 text-red-400" />,
  mentor: <Crown className="w-4 h-4 text-purple-400" />,
  ally: <Heart className="w-4 h-4 text-pink-400" />,
  rival: <Swords className="w-4 h-4 text-orange-400" />,
};

export default function CharactersPage() {
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'canon' | 'custom'>('all');

  useEffect(() => {
    async function loadCharacters() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      let query = supabase
        .from('characters')
        .select('*')
        .order('name');
      
      if (filter === 'canon') {
        query = query.eq('is_canon', true);
      } else if (filter === 'custom') {
        query = query.eq('is_canon', false);
      }
      
      const { data } = await query;
      
      if (data) {
        setCharacters(data);
      }
      
      setLoading(false);
    }
    
    loadCharacters();
  }, [router, filter]);

  const filteredCharacters = characters.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.title?.toLowerCase().includes(searchQuery.toLowerCase())
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
              <Users className="w-5 h-5 text-[var(--gold)]" />
              <h1 className="text-xl font-bold text-white">Characters</h1>
            </div>
          </div>
          
          <Link
            href="/characters/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-black rounded-lg font-medium hover:bg-[var(--gold-light)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Character
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
              placeholder="Search characters..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--background-light)] rounded-lg border border-[var(--gold)]/20 text-white focus:outline-none focus:border-[var(--gold)]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--foreground-muted)]" />
            {(['all', 'canon', 'custom'] as const).map((f) => (
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

        {/* Character Grid */}
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Characters Yet</h2>
            <p className="text-[var(--foreground-muted)] mb-6">
              {filter === 'all' 
                ? 'Start building the cast of Everloop'
                : filter === 'canon'
                ? 'No canon characters found'
                : 'Create your first custom character'}
            </p>
            <Link
              href="/characters/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-black rounded-lg font-medium hover:bg-[var(--gold-light)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Character
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCharacters.map((character) => (
              <Link
                key={character.id}
                href={`/characters/${character.id}`}
                className="group p-6 bg-[var(--background-light)] rounded-xl border border-[var(--gold)]/10 hover:border-[var(--gold)]/30 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] font-bold text-lg">
                    {character.name.charAt(0)}
                  </div>
                  <div className="flex items-center gap-2">
                    {character.is_canon && (
                      <span className="px-2 py-0.5 bg-[var(--gold)]/20 text-[var(--gold)] text-xs rounded-full">
                        Canon
                      </span>
                    )}
                    {ROLE_ICONS[character.role]}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-white group-hover:text-[var(--gold)] transition-colors">
                  {character.name}
                </h3>
                {character.title && (
                  <p className="text-sm text-[var(--gold)] mb-2">{character.title}</p>
                )}
                <p className="text-sm text-[var(--foreground-muted)] line-clamp-3">
                  {character.description || 'No description yet...'}
                </p>
                
                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                  <span className="capitalize">{character.role}</span>
                  <span>•</span>
                  <span className="capitalize">{character.status}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
