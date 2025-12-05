'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Users,
  Sparkles,
  Crown,
  Swords,
  Heart,
  Skull,
  Star,
  Edit,
  BookOpen,
  Calendar
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Character {
  id: string;
  name: string;
  title: string;
  description: string;
  role: string;
  status: string;
  backstory: string;
  personality_traits: string[];
  physical_description: string;
  abilities: string[];
  relationships: string;
  is_canon: boolean;
  created_at: string;
  created_by: string;
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  protagonist: <Star className="w-5 h-5 text-[var(--gold)]" />,
  antagonist: <Skull className="w-5 h-5 text-red-400" />,
  mentor: <Crown className="w-5 h-5 text-purple-400" />,
  ally: <Heart className="w-5 h-5 text-pink-400" />,
  rival: <Swords className="w-5 h-5 text-orange-400" />,
};

export default function CharacterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const characterId = params.id as string;
  
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function loadCharacter() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      const { data } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single();
      
      if (data) {
        setCharacter(data);
        setIsOwner(data.created_by === user.id);
      }
      
      setLoading(false);
    }
    
    loadCharacter();
  }, [router, characterId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--gold)]">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center">
        <Users className="w-12 h-12 text-[var(--foreground-muted)] mb-4" />
        <h1 className="text-xl font-semibold text-white mb-2">Character Not Found</h1>
        <Link href="/characters" className="text-[var(--gold)] hover:underline">
          Back to Characters
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--background-light)] border-b border-[var(--gold)]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/characters" 
              className="text-[var(--foreground-muted)] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--gold)]" />
              <h1 className="text-xl font-bold text-white">Character Profile</h1>
            </div>
          </div>
          
          {isOwner && (
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] rounded-lg text-[var(--foreground-muted)] hover:text-white transition-colors">
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Character Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-[var(--gold)]/20 flex items-center justify-center text-[var(--gold)] font-bold text-4xl shrink-0">
            {character.name.charAt(0)}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{character.name}</h1>
              {character.is_canon && (
                <span className="px-3 py-1 bg-[var(--gold)]/20 text-[var(--gold)] text-sm rounded-full">
                  Canon
                </span>
              )}
            </div>
            {character.title && (
              <p className="text-lg text-[var(--gold)] mb-2">{character.title}</p>
            )}
            <div className="flex items-center gap-4 text-sm text-[var(--foreground-muted)]">
              <span className="flex items-center gap-1">
                {ROLE_ICONS[character.role] || <Users className="w-4 h-4" />}
                <span className="capitalize">{character.role}</span>
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span className="capitalize">{character.status}</span>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(character.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Character Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <section className="p-6 bg-[var(--background-light)] rounded-xl border border-[var(--gold)]/10">
              <h2 className="text-lg font-semibold text-white mb-4">Description</h2>
              <p className="text-[var(--foreground-muted)] whitespace-pre-wrap">
                {character.description || 'No description provided.'}
              </p>
            </section>

            {/* Backstory */}
            {character.backstory && (
              <section className="p-6 bg-[var(--background-light)] rounded-xl border border-[var(--gold)]/10">
                <h2 className="text-lg font-semibold text-white mb-4">Backstory</h2>
                <p className="text-[var(--foreground-muted)] whitespace-pre-wrap">
                  {character.backstory}
                </p>
              </section>
            )}

            {/* Physical Description */}
            {character.physical_description && (
              <section className="p-6 bg-[var(--background-light)] rounded-xl border border-[var(--gold)]/10">
                <h2 className="text-lg font-semibold text-white mb-4">Physical Description</h2>
                <p className="text-[var(--foreground-muted)] whitespace-pre-wrap">
                  {character.physical_description}
                </p>
              </section>
            )}

            {/* Relationships */}
            {character.relationships && (
              <section className="p-6 bg-[var(--background-light)] rounded-xl border border-[var(--gold)]/10">
                <h2 className="text-lg font-semibold text-white mb-4">Relationships</h2>
                <p className="text-[var(--foreground-muted)] whitespace-pre-wrap">
                  {character.relationships}
                </p>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Personality Traits */}
            {character.personality_traits && character.personality_traits.length > 0 && (
              <section className="p-6 bg-[var(--background-light)] rounded-xl border border-[var(--gold)]/10">
                <h2 className="text-lg font-semibold text-white mb-4">Personality</h2>
                <div className="flex flex-wrap gap-2">
                  {character.personality_traits.map((trait, i) => (
                    <span key={i} className="px-3 py-1 bg-[var(--gold)]/10 text-[var(--gold)] text-sm rounded-full">
                      {trait}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Abilities */}
            {character.abilities && character.abilities.length > 0 && (
              <section className="p-6 bg-[var(--background-light)] rounded-xl border border-[var(--gold)]/10">
                <h2 className="text-lg font-semibold text-white mb-4">Abilities</h2>
                <ul className="space-y-2">
                  {character.abilities.map((ability, i) => (
                    <li key={i} className="flex items-center gap-2 text-[var(--foreground-muted)]">
                      <Sparkles className="w-4 h-4 text-[var(--gold)]" />
                      {ability}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
