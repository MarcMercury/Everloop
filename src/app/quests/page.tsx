'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Plus, 
  Search,
  Trophy,
  Sparkles,
  Filter,
  Clock,
  CheckCircle,
  Star,
  Target
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Quest {
  id: string;
  title: string;
  description: string;
  quest_type: string;
  difficulty: string;
  status: string;
  xp_reward: number;
  created_at: string;
  created_by: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-green-400 bg-green-400/20',
  medium: 'text-yellow-400 bg-yellow-400/20',
  hard: 'text-orange-400 bg-orange-400/20',
  legendary: 'text-purple-400 bg-purple-400/20',
};

export default function QuestsPage() {
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    async function loadQuests() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      let query = supabase
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (filter === 'active') {
        query = query.eq('status', 'active');
      } else if (filter === 'completed') {
        query = query.eq('status', 'completed');
      }
      
      const { data } = await query;
      
      if (data) {
        setQuests(data);
      }
      
      setLoading(false);
    }
    
    loadQuests();
  }, [router, filter]);

  const filteredQuests = quests.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
              <Trophy className="w-5 h-5 text-[var(--gold)]" />
              <h1 className="text-xl font-bold text-white">Quests</h1>
            </div>
          </div>
          
          <Link
            href="/quests/new"
            className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-black rounded-lg font-medium hover:bg-[var(--gold-light)] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Quest
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
              placeholder="Search quests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--background-light)] rounded-lg border border-[var(--gold)]/20 text-white focus:outline-none focus:border-[var(--gold)]"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--foreground-muted)]" />
            {(['all', 'active', 'completed'] as const).map((f) => (
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

        {/* Quest Grid */}
        {filteredQuests.length === 0 ? (
          <div className="text-center py-16">
            <Trophy className="w-12 h-12 text-[var(--foreground-muted)] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Quests Found</h2>
            <p className="text-[var(--foreground-muted)] mb-6">
              {filter === 'all' 
                ? 'Create your first quest to challenge writers'
                : filter === 'active'
                ? 'No active quests at the moment'
                : 'No completed quests yet'}
            </p>
            <Link
              href="/quests/new"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-black rounded-lg font-medium hover:bg-[var(--gold-light)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Quest
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuests.map((quest) => (
              <Link
                key={quest.id}
                href={`/quests/${quest.id}`}
                className="group flex items-center gap-6 p-6 bg-[var(--background-light)] rounded-xl border border-[var(--gold)]/10 hover:border-[var(--gold)]/30 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--gold)]/20 flex items-center justify-center shrink-0">
                  {quest.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  ) : (
                    <Target className="w-6 h-6 text-[var(--gold)]" />
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-[var(--gold)] transition-colors truncate">
                      {quest.title}
                    </h3>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${DIFFICULTY_COLORS[quest.difficulty] || DIFFICULTY_COLORS.medium}`}>
                      {quest.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">
                    {quest.description || 'No description...'}
                  </p>
                </div>
                
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1 text-[var(--gold)]">
                    <Star className="w-4 h-4" />
                    <span className="font-semibold">{quest.xp_reward || 100} XP</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--foreground-muted)] mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(quest.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
