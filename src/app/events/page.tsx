'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft,
  Calendar,
  Trophy,
  Clock,
  Star,
  Users,
  Sparkles,
  Award,
  BookOpen,
  Zap,
  Timer,
  ArrowRight,
  Check,
  Crown,
  Flame
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface WorldEvent {
  id: string;
  name: string;
  description: string;
  long_description?: string;
  event_type: string;
  theme: string;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  reward_reputation: number;
  requirements?: Record<string, unknown>;
}

interface EventSubmission {
  id: string;
  event_id: string;
  user_id: string;
  submission_type: string;
  submission_note?: string;
  status: string;
  votes: number;
  is_winner: boolean;
  submitted_at: string;
  profiles?: {
    display_name: string;
    avatar_url?: string;
  };
}

export default function EventsPage() {
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<WorldEvent | null>(null);
  const [submissions, setSubmissions] = useState<EventSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  useEffect(() => {
    async function loadEvents() {
      const supabase = createClient();
      
      const { data: eventsData } = await supabase
        .from('world_events')
        .select('*')
        .order('starts_at', { ascending: false });
      
      if (eventsData) {
        setEvents(eventsData);
        // Select the first active event by default
        const activeEvent = eventsData.find(e => e.is_active);
        if (activeEvent) {
          setSelectedEvent(activeEvent);
          loadSubmissions(activeEvent.id);
        }
      }
      
      setLoading(false);
    }
    
    loadEvents();
  }, []);

  async function loadSubmissions(eventId: string) {
    const supabase = createClient();
    
    const { data: submissionsData } = await supabase
      .from('event_submissions')
      .select(`
        *,
        profiles (display_name, avatar_url)
      `)
      .eq('event_id', eventId)
      .order('votes', { ascending: false })
      .limit(20);
    
    if (submissionsData) {
      setSubmissions(submissionsData);
    }
    
    // Check if current user has submitted
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userSubmission } = await supabase
        .from('event_submissions')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .single();
      
      setHasSubmitted(!!userSubmission);
    }
  }

  function getTimeRemaining(endDate: string) {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  }

  function getEventTypeIcon(type: string) {
    switch (type) {
      case 'seasonal': return <Flame className="w-5 h-5" />;
      case 'monthly': return <Calendar className="w-5 h-5" />;
      case 'special': return <Star className="w-5 h-5" />;
      default: return <Zap className="w-5 h-5" />;
    }
  }

  function getEventTypeColor(type: string) {
    switch (type) {
      case 'seasonal': return 'text-orange-400 bg-orange-400/10';
      case 'monthly': return 'text-blue-400 bg-blue-400/10';
      case 'special': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Sparkles className="w-8 h-8 animate-pulse text-[var(--accent-gold)]" />
          <p className="text-[var(--foreground-muted)]">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] constellation-bg">
      {/* Header */}
      <div className="bg-gradient-to-b from-[var(--accent-gold)]/10 to-transparent border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-[var(--foreground-muted)] hover:text-white mb-6 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent-gold)] to-orange-500 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-serif font-bold">World Events</h1>
              <p className="text-[var(--foreground-muted)]">Seasonal challenges and community competitions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Events List */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-semibold mb-4">Active & Recent Events</h2>
            
            {events.length === 0 ? (
              <div className="card text-center py-8">
                <Calendar className="w-12 h-12 mx-auto mb-4 text-[var(--foreground-muted)] opacity-50" />
                <p className="text-[var(--foreground-muted)]">No events yet</p>
              </div>
            ) : (
              events.map((event) => (
                <button
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    loadSubmissions(event.id);
                  }}
                  className={`w-full text-left card transition-all ${
                    selectedEvent?.id === event.id
                      ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/5'
                      : 'hover:border-[var(--accent-gold)]/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getEventTypeColor(event.event_type)}`}>
                      {getEventTypeIcon(event.event_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{event.name}</h3>
                        {event.is_active && (
                          <span className="px-2 py-0.5 bg-[var(--success)]/20 text-[var(--success)] text-xs rounded-full">
                            LIVE
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">{event.description}</p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[var(--foreground-muted)]">
                        <span className="flex items-center gap-1">
                          <Timer className="w-3 h-3" />
                          {getTimeRemaining(event.ends_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-[var(--accent-gold)]" />
                          +{event.reward_reputation}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Event Details */}
          <div className="lg:col-span-2">
            {selectedEvent ? (
              <div className="space-y-6">
                {/* Event Header */}
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getEventTypeColor(selectedEvent.event_type)}`}>
                      {selectedEvent.event_type} Event
                    </div>
                    {selectedEvent.is_active && (
                      <div className="flex items-center gap-2 text-[var(--success)]">
                        <span className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Active Now</span>
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-serif font-bold mb-3">{selectedEvent.name}</h2>
                  
                  <div className="prose prose-invert max-w-none mb-6">
                    <p className="text-[var(--foreground-muted)] whitespace-pre-line">
                      {selectedEvent.long_description || selectedEvent.description}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 p-4 bg-[var(--background-secondary)] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[var(--foreground-muted)]" />
                      <div>
                        <p className="text-xs text-[var(--foreground-muted)]">Duration</p>
                        <p className="text-sm font-medium">
                          {new Date(selectedEvent.starts_at).toLocaleDateString()} - {new Date(selectedEvent.ends_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-[var(--foreground-muted)]" />
                      <div>
                        <p className="text-xs text-[var(--foreground-muted)]">Time Left</p>
                        <p className="text-sm font-medium">{getTimeRemaining(selectedEvent.ends_at)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-[var(--accent-gold)]" />
                      <div>
                        <p className="text-xs text-[var(--foreground-muted)]">Reward</p>
                        <p className="text-sm font-medium">+{selectedEvent.reward_reputation} Reputation</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedEvent.is_active && (
                    <div className="mt-6 flex gap-3">
                      {hasSubmitted ? (
                        <div className="flex items-center gap-2 text-[var(--success)]">
                          <Check className="w-5 h-5" />
                          <span>You&apos;ve submitted to this event!</span>
                        </div>
                      ) : (
                        <Link
                          href={`/story/new?event=${selectedEvent.id}`}
                          className="btn-primary flex items-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Write Your Entry
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Submissions */}
                <div className="card">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[var(--accent-blue)]" />
                    Top Submissions
                  </h3>
                  
                  {submissions.length === 0 ? (
                    <div className="text-center py-8 text-[var(--foreground-muted)]">
                      <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No submissions yet. Be the first!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {submissions.map((sub, index) => (
                        <div 
                          key={sub.id}
                          className={`flex items-center gap-4 p-4 rounded-lg ${
                            index === 0 ? 'bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30' :
                            index === 1 ? 'bg-gray-400/5 border border-gray-400/20' :
                            index === 2 ? 'bg-amber-600/5 border border-amber-600/20' :
                            'bg-[var(--background-secondary)]'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? 'bg-[var(--accent-gold)] text-black' :
                            index === 1 ? 'bg-gray-400 text-black' :
                            index === 2 ? 'bg-amber-600 text-white' :
                            'bg-[var(--background-tertiary)] text-[var(--foreground-muted)]'
                          }`}>
                            {index < 3 ? <Crown className="w-4 h-4" /> : index + 1}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {sub.profiles?.display_name || 'Anonymous'}
                            </p>
                            {sub.submission_note && (
                              <p className="text-sm text-[var(--foreground-muted)] truncate">{sub.submission_note}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-[var(--foreground-muted)]">
                            <span className="text-sm capitalize px-2 py-0.5 bg-[var(--background-tertiary)] rounded">
                              {sub.submission_type}
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {sub.votes}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card text-center py-16">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-[var(--foreground-muted)] opacity-50" />
                <h3 className="text-xl font-serif font-semibold mb-2">Select an Event</h3>
                <p className="text-[var(--foreground-muted)]">
                  Choose an event from the list to see details and submissions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
