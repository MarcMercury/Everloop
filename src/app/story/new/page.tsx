'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  FileText, 
  BookOpen, 
  GitBranch, 
  ChevronRight,
  ChevronLeft,
  MapPin,
  Users,
  Clock,
  Layers,
  ArrowRight,
  Check,
  Plus,
  UserPlus,
  MapPinPlus
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Arc, Location, Character, TimePeriod, Story, StoryType } from '@/types/database';
import CharacterCreationWizard, { CreatedCharacter } from '@/components/CharacterCreationWizard';
import LocationCreationWizard, { CreatedLocation } from '@/components/LocationCreationWizard';

type Step = 'type' | 'anchor' | 'title';

export default function NewStoryPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('type');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  
  // Story setup state
  const [storyType, setStoryType] = useState<StoryType | null>(null);
  const [storyTitle, setStoryTitle] = useState('');
  const [selectedArcs, setSelectedArcs] = useState<Arc[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);
  const [selectedCharacters, setSelectedCharacters] = useState<Character[]>([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState<TimePeriod | null>(null);
  const [connectionNote, setConnectionNote] = useState('');
  const [branchFromStory, setBranchFromStory] = useState<Story | null>(null);
  
  // Canon data
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
  const [approvedStories, setApprovedStories] = useState<Story[]>([]);

  // Wizard states
  const [showCharacterWizard, setShowCharacterWizard] = useState(false);
  const [showLocationWizard, setShowLocationWizard] = useState(false);

  useEffect(() => {
    async function loadCanonData() {
      const supabase = createClient();
      
      const [arcsRes, locationsRes, charactersRes, periodsRes, storiesRes] = await Promise.all([
        supabase.from('arcs').select('*').order('name'),
        supabase.from('locations').select('*').order('name'),
        supabase.from('characters').select('*').order('name'),
        supabase.from('time_periods').select('*').order('chronological_order'),
        supabase.from('stories').select('*').eq('status', 'approved').order('title'),
      ]);

      if (arcsRes.data) setArcs(arcsRes.data);
      if (locationsRes.data) setLocations(locationsRes.data);
      if (charactersRes.data) setCharacters(charactersRes.data);
      if (periodsRes.data) setTimePeriods(periodsRes.data);
      if (storiesRes.data) setApprovedStories(storiesRes.data);
      
      setDataLoading(false);
    }

    loadCanonData();
  }, []);

  const handleCreateStory = async () => {
    if (!storyType) return;
    
    setLoading(true);
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Create story
    const { data: story, error: storyError } = await supabase
      .from('stories')
      .insert({
        author_id: user.id,
        title: storyTitle || 'Untitled Story',
        type: storyType,
        status: 'draft',
        content: '',
        word_count: 0,
      })
      .select()
      .single();

    if (storyError || !story) {
      console.error('Error creating story:', storyError);
      setLoading(false);
      return;
    }

    // Create metadata
    const { error: metaError } = await supabase
      .from('story_metadata')
      .insert({
        story_id: story.id,
        arc_ids: selectedArcs.map(a => a.id),
        location_ids: selectedLocations.map(l => l.id),
        character_ids: selectedCharacters.map(c => c.id),
        time_period_id: selectedTimePeriod?.id || null,
        connection_note: connectionNote || null,
        branch_from_story_id: branchFromStory?.id || null,
      });

    if (metaError) {
      console.error('Error creating metadata:', metaError);
    }

    router.push(`/editor/${story.id}`);
  };

  const storyTypes = [
    {
      type: 'short' as StoryType,
      title: 'Short-Form Story',
      description: 'A self-contained scene or episode. Perfect for exploring a moment, a character study, or a brief encounter within the Everloop universe.',
      icon: FileText,
      color: 'var(--accent-blue)',
    },
    {
      type: 'long' as StoryType,
      title: 'Long-Form Story',
      description: 'A multi-chapter arc with room for complex narratives, character development, and deeper exploration of Everloop\'s mysteries.',
      icon: BookOpen,
      color: 'var(--accent-purple)',
    },
    {
      type: 'branch' as StoryType,
      title: 'Branch from Existing',
      description: 'Extend or spin off an existing storyline. Build upon approved stories to explore "what if" scenarios or continue unfinished threads.',
      icon: GitBranch,
      color: 'var(--accent-gold)',
    },
  ];

  const toggleArc = (arc: Arc) => {
    if (selectedArcs.find(a => a.id === arc.id)) {
      setSelectedArcs(selectedArcs.filter(a => a.id !== arc.id));
    } else {
      setSelectedArcs([...selectedArcs, arc]);
    }
  };

  const toggleLocation = (location: Location) => {
    if (selectedLocations.find(l => l.id === location.id)) {
      setSelectedLocations(selectedLocations.filter(l => l.id !== location.id));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const toggleCharacter = (character: Character) => {
    if (selectedCharacters.find(c => c.id === character.id)) {
      setSelectedCharacters(selectedCharacters.filter(c => c.id !== character.id));
    } else {
      setSelectedCharacters([...selectedCharacters, character]);
    }
  };

  const handleCharacterCreated = (newChar: CreatedCharacter) => {
    // Convert to Character type and add to both lists
    const character: Character = {
      id: newChar.id,
      name: newChar.name,
      description: newChar.description,
      status: newChar.status,
      traits: newChar.traits,
      is_locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setCharacters(prev => [character, ...prev]);
    setSelectedCharacters(prev => [...prev, character]);
  };

  const handleLocationCreated = (newLoc: CreatedLocation) => {
    // Convert to Location type and add to both lists
    const location: Location = {
      id: newLoc.id,
      name: newLoc.name,
      region: newLoc.region,
      description: newLoc.description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setLocations(prev => [location, ...prev]);
    setSelectedLocations(prev => [...prev, location]);
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[var(--accent-gold)]" />
          <span className="text-[var(--foreground-muted)]">Loading canon data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] constellation-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
              Back to Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold font-serif">New Story</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Progress Indicator */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center gap-4">
          <div className={`flex items-center gap-2 ${step === 'type' ? 'text-white' : 'text-[var(--foreground-muted)]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'type' ? 'bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)]' : storyType ? 'bg-[var(--success)]' : 'bg-[var(--background-tertiary)]'}`}>
              {storyType ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <span className="hidden sm:inline">Story Type</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
          <div className={`flex items-center gap-2 ${step === 'anchor' ? 'text-white' : 'text-[var(--foreground-muted)]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'anchor' ? 'bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)]' : selectedArcs.length > 0 ? 'bg-[var(--success)]' : 'bg-[var(--background-tertiary)]'}`}>
              {selectedArcs.length > 0 && step !== 'anchor' ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <span className="hidden sm:inline">Anchor</span>
          </div>
          <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)]" />
          <div className={`flex items-center gap-2 ${step === 'title' ? 'text-white' : 'text-[var(--foreground-muted)]'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === 'title' ? 'bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)]' : 'bg-[var(--background-tertiary)]'}`}>
              3
            </div>
            <span className="hidden sm:inline">Title</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Step 1: Choose Story Type */}
        {step === 'type' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold mb-2">Choose Your Story Type</h1>
              <p className="text-[var(--foreground-muted)]">
                Select how you&apos;re contributing to the Everloop universe
              </p>
            </div>

            <div className="grid gap-6">
              {storyTypes.map((type) => (
                <button
                  key={type.type}
                  onClick={() => {
                    setStoryType(type.type);
                    setStep('anchor');
                  }}
                  className={`card text-left flex items-start gap-6 group ${storyType === type.type ? 'border-[var(--accent-gold)]' : ''}`}
                >
                  <div 
                    className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
                    style={{ backgroundColor: `${type.color}20` }}
                  >
                    <type.icon className="w-8 h-8" style={{ color: type.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-semibold mb-2 group-hover:text-[var(--accent-gold)] transition-colors">
                      {type.title}
                    </h3>
                    <p className="text-[var(--foreground-muted)]">{type.description}</p>
                  </div>
                  <ArrowRight className="w-6 h-6 text-[var(--foreground-muted)] group-hover:text-[var(--accent-gold)] group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Anchor to Universe */}
        {step === 'anchor' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold mb-2">Anchor to the Universe</h1>
              <p className="text-[var(--foreground-muted)]">
                Connect your story to what already exists in Everloop
              </p>
            </div>

            <div className="space-y-8">
              {/* Arcs */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-5 h-5 text-[var(--accent-blue)]" />
                  <h3 className="text-lg font-semibold">Story Arcs</h3>
                  <span className="text-sm text-[var(--foreground-muted)]">(Select one or more)</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {arcs.map((arc) => (
                    <button
                      key={arc.id}
                      onClick={() => toggleArc(arc)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedArcs.find(a => a.id === arc.id)
                          ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)]/10'
                          : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--accent-blue)]/50'
                      }`}
                    >
                      <h4 className="font-semibold mb-1">{arc.name}</h4>
                      {arc.era && <span className="text-xs text-[var(--accent-gold)]">{arc.era}</span>}
                      {arc.description && (
                        <p className="text-sm text-[var(--foreground-muted)] mt-2 line-clamp-2">{arc.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[var(--accent-purple)]" />
                    <h3 className="text-lg font-semibold">Locations</h3>
                    <span className="text-sm text-[var(--foreground-muted)]">(Optional)</span>
                  </div>
                  <button
                    onClick={() => setShowLocationWizard(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--accent-purple)]/10 hover:bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] rounded-lg transition-colors"
                  >
                    <MapPinPlus className="w-4 h-4" />
                    Create New Location
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      onClick={() => toggleLocation(location)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedLocations.find(l => l.id === location.id)
                          ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/10'
                          : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--accent-purple)]/50'
                      }`}
                    >
                      <h4 className="font-semibold mb-1">{location.name}</h4>
                      {location.region && <span className="text-xs text-[var(--foreground-muted)]">{location.region}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Characters */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-[var(--accent-gold)]" />
                    <h3 className="text-lg font-semibold">Characters</h3>
                    <span className="text-sm text-[var(--foreground-muted)]">(Optional)</span>
                  </div>
                  <button
                    onClick={() => setShowCharacterWizard(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--accent-gold)]/10 hover:bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] rounded-lg transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    Create New Character
                  </button>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {characters.map((character) => (
                    <button
                      key={character.id}
                      onClick={() => toggleCharacter(character)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedCharacters.find(c => c.id === character.id)
                          ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10'
                          : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--accent-gold)]/50'
                      }`}
                    >
                      <h4 className="font-semibold mb-1">{character.name}</h4>
                      {character.status && <span className="text-xs text-[var(--foreground-muted)] capitalize">{character.status}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Period */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[var(--success)]" />
                  <h3 className="text-lg font-semibold">Time Period</h3>
                  <span className="text-sm text-[var(--foreground-muted)]">(Optional)</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {timePeriods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedTimePeriod(selectedTimePeriod?.id === period.id ? null : period)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedTimePeriod?.id === period.id
                          ? 'border-[var(--success)] bg-[var(--success)]/10'
                          : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--success)]/50'
                      }`}
                    >
                      <h4 className="font-semibold mb-1">{period.name}</h4>
                      {period.description && (
                        <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">{period.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Branch From (only for branch type) */}
              {storyType === 'branch' && approvedStories.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <GitBranch className="w-5 h-5 text-[var(--warning)]" />
                    <h3 className="text-lg font-semibold">Branch From Story</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {approvedStories.map((story) => (
                      <button
                        key={story.id}
                        onClick={() => setBranchFromStory(branchFromStory?.id === story.id ? null : story)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          branchFromStory?.id === story.id
                            ? 'border-[var(--warning)] bg-[var(--warning)]/10'
                            : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--warning)]/50'
                        }`}
                      >
                        <h4 className="font-semibold mb-1">{story.title}</h4>
                        {story.synopsis && (
                          <p className="text-sm text-[var(--foreground-muted)] line-clamp-2">{story.synopsis}</p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Connection Note */}
              <div>
                <label className="block text-lg font-semibold mb-2">
                  Connection Note <span className="text-sm text-[var(--foreground-muted)] font-normal">(Optional)</span>
                </label>
                <textarea
                  value={connectionNote}
                  onChange={(e) => setConnectionNote(e.target.value)}
                  placeholder="Describe how your story connects to the Everloop universe. This helps the AI assistant understand your intent..."
                  rows={4}
                  className="w-full"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep('type')}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Back
              </button>
              <button
                onClick={() => setStep('title')}
                disabled={selectedArcs.length === 0}
                className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Title */}
        {step === 'title' && (
          <div className="animate-fade-in">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-bold mb-2">Name Your Story</h1>
              <p className="text-[var(--foreground-muted)]">
                Give your story a title (you can change this later)
              </p>
            </div>

            <div className="max-w-xl mx-auto">
              <div className="mb-8">
                <label htmlFor="title" className="block text-lg font-semibold mb-2">
                  Story Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={storyTitle}
                  onChange={(e) => setStoryTitle(e.target.value)}
                  placeholder="Enter your story title..."
                  className="text-xl"
                />
              </div>

              {/* Summary */}
              <div className="p-6 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] mb-8">
                <h3 className="font-semibold mb-4">Story Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">Type:</span>
                    <span className="capitalize">{storyType}-form</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">Arcs:</span>
                    <span>{selectedArcs.map(a => a.name).join(', ') || 'None'}</span>
                  </div>
                  {selectedLocations.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--foreground-muted)]">Locations:</span>
                      <span>{selectedLocations.map(l => l.name).join(', ')}</span>
                    </div>
                  )}
                  {selectedCharacters.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-[var(--foreground-muted)]">Characters:</span>
                      <span>{selectedCharacters.map(c => c.name).join(', ')}</span>
                    </div>
                  )}
                  {selectedTimePeriod && (
                    <div className="flex justify-between">
                      <span className="text-[var(--foreground-muted)]">Time Period:</span>
                      <span>{selectedTimePeriod.name}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setStep('anchor')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleCreateStory}
                  disabled={loading}
                  className="btn-primary flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Sparkles className="w-5 h-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Start Writing
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Character Creation Wizard */}
      <CharacterCreationWizard
        isOpen={showCharacterWizard}
        onClose={() => setShowCharacterWizard(false)}
        onCharacterCreated={handleCharacterCreated}
      />

      {/* Location Creation Wizard */}
      <LocationCreationWizard
        isOpen={showLocationWizard}
        onClose={() => setShowLocationWizard(false)}
        onLocationCreated={handleLocationCreated}
      />
    </div>
  );
}
