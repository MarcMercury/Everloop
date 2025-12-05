'use client';

import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, User, Sparkles, Check, AlertCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface CharacterCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterCreated: (character: CreatedCharacter) => void;
}

export interface CreatedCharacter {
  id: string;
  name: string;
  description: string;
  status: string;
  traits: string[];
}

type WizardStep = 'basics' | 'traits' | 'background' | 'review';

const CHARACTER_STATUSES = [
  { value: 'active', label: 'Active', description: 'Currently alive and present in the world' },
  { value: 'deceased', label: 'Deceased', description: 'Has died but may appear in flashbacks or memories' },
  { value: 'unknown', label: 'Unknown', description: 'Fate is uncertain or mysterious' },
  { value: 'legendary', label: 'Legendary', description: 'Exists more in myth than confirmed history' },
  { value: 'cursed', label: 'Cursed', description: 'Bound by supernatural affliction' },
];

const SUGGESTED_TRAITS = [
  // Personality
  'wise', 'cunning', 'noble', 'tragic', 'mysterious', 'brave', 'cautious', 'ambitious',
  'loyal', 'treacherous', 'compassionate', 'cold', 'charismatic', 'withdrawn', 'idealistic', 'pragmatic',
  // Background
  'ancient', 'young', 'exiled', 'orphaned', 'noble-born', 'common', 'scholarly', 'warrior',
  // Supernatural
  'weaver', 'fray-touched', 'shard-bearer', 'prophetic', 'haunted', 'blessed', 'cursed',
  // Role
  'leader', 'follower', 'wanderer', 'guardian', 'seeker', 'healer', 'destroyer'
];

export default function CharacterCreationWizard({ 
  isOpen, 
  onClose, 
  onCharacterCreated 
}: CharacterCreationWizardProps) {
  const [step, setStep] = useState<WizardStep>('basics');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [status, setStatus] = useState('active');
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const [customTrait, setCustomTrait] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [backstory, setBackstory] = useState('');
  const [connections, setConnections] = useState('');

  const steps: { key: WizardStep; label: string }[] = [
    { key: 'basics', label: 'Basics' },
    { key: 'traits', label: 'Traits' },
    { key: 'background', label: 'Background' },
    { key: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);

  const canProceed = () => {
    switch (step) {
      case 'basics':
        return name.trim().length >= 2;
      case 'traits':
        return selectedTraits.length >= 1;
      case 'background':
        return shortDescription.trim().length >= 10;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const currentIndex = steps.findIndex(s => s.key === step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1].key);
    }
  };

  const prevStep = () => {
    const currentIndex = steps.findIndex(s => s.key === step);
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1].key);
    }
  };

  const toggleTrait = (trait: string) => {
    if (selectedTraits.includes(trait)) {
      setSelectedTraits(selectedTraits.filter(t => t !== trait));
    } else if (selectedTraits.length < 5) {
      setSelectedTraits([...selectedTraits, trait]);
    }
  };

  const addCustomTrait = () => {
    const trait = customTrait.trim().toLowerCase();
    if (trait && !selectedTraits.includes(trait) && selectedTraits.length < 5) {
      setSelectedTraits([...selectedTraits, trait]);
      setCustomTrait('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      // Build full description from short description and backstory
      const fullDescription = backstory 
        ? `${shortDescription}\n\n${backstory}` 
        : shortDescription;

      const { data, error: insertError } = await supabase
        .from('characters')
        .insert({
          name: name.trim(),
          description: fullDescription,
          status,
          traits: selectedTraits,
          is_locked: false, // User-created characters are not locked
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onCharacterCreated({
        id: data.id,
        name: data.name,
        description: data.description,
        status: data.status,
        traits: data.traits,
      });

      // Reset form
      setName('');
      setStatus('active');
      setSelectedTraits([]);
      setShortDescription('');
      setBackstory('');
      setConnections('');
      setStep('basics');
      onClose();
    } catch (err) {
      console.error('Error creating character:', err);
      setError('Failed to create character. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[var(--background)] border border-[var(--border)] rounded-2xl shadow-2xl m-4">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-[var(--border)] bg-[var(--background)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-purple)] flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">Create New Character</h2>
              <p className="text-sm text-[var(--foreground-muted)]">
                Step {currentStepIndex + 1} of {steps.length}: {steps[currentStepIndex].label}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--foreground-muted)] hover:text-white hover:bg-[var(--background-secondary)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s.key} className="flex-1 flex items-center">
                <div 
                  className={`w-full h-2 rounded-full transition-colors ${
                    i < currentStepIndex 
                      ? 'bg-[var(--success)]' 
                      : i === currentStepIndex 
                        ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[var(--accent-purple)]' 
                        : 'bg-[var(--background-tertiary)]'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-[var(--error)]/10 border border-[var(--error)]/30 rounded-lg flex items-center gap-3 text-[var(--error)]">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {/* Step 1: Basics */}
          {step === 'basics' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Character Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter character name..."
                  className="w-full text-lg"
                  autoFocus
                />
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  Choose a name that fits the Everloop universe. Names often reflect culture, status, or destiny.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Current Status</label>
                <div className="grid gap-3">
                  {CHARACTER_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setStatus(s.value)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        status === s.value
                          ? 'border-[var(--accent-gold)] bg-[var(--accent-gold)]/10'
                          : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--accent-gold)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{s.label}</span>
                        {status === s.value && <Check className="w-4 h-4 text-[var(--accent-gold)]" />}
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)] mt-1">{s.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Traits */}
          {step === 'traits' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Character Traits <span className="text-[var(--foreground-muted)]">({selectedTraits.length}/5 selected)</span>
                </label>
                <p className="text-sm text-[var(--foreground-muted)] mb-4">
                  Select 1-5 traits that define your character. These help maintain consistency across stories.
                </p>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {SUGGESTED_TRAITS.map((trait) => (
                    <button
                      key={trait}
                      onClick={() => toggleTrait(trait)}
                      disabled={selectedTraits.length >= 5 && !selectedTraits.includes(trait)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        selectedTraits.includes(trait)
                          ? 'bg-[var(--accent-gold)] text-black font-medium'
                          : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTrait}
                    onChange={(e) => setCustomTrait(e.target.value)}
                    placeholder="Add custom trait..."
                    className="flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && addCustomTrait()}
                  />
                  <button
                    onClick={addCustomTrait}
                    disabled={!customTrait.trim() || selectedTraits.length >= 5}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>

              {selectedTraits.length > 0 && (
                <div className="p-4 bg-[var(--background-secondary)] rounded-lg">
                  <p className="text-sm font-medium mb-2">Selected Traits:</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTraits.map((trait) => (
                      <span
                        key={trait}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[var(--accent-gold)] text-black rounded-full text-sm font-medium"
                      >
                        {trait}
                        <button
                          onClick={() => toggleTrait(trait)}
                          className="hover:text-[var(--error)]"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Background */}
          {step === 'background' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Short Description <span className="text-[var(--error)]">*</span>
                </label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="A brief description that will appear in character lists..."
                  rows={3}
                  className="w-full"
                />
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  This appears in search results and character selection. Keep it concise but evocative.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Extended Backstory <span className="text-[var(--foreground-muted)]">(Optional)</span>
                </label>
                <textarea
                  value={backstory}
                  onChange={(e) => setBackstory(e.target.value)}
                  placeholder="Deeper history, motivations, secrets..."
                  rows={5}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Known Connections <span className="text-[var(--foreground-muted)]">(Optional)</span>
                </label>
                <textarea
                  value={connections}
                  onChange={(e) => setConnections(e.target.value)}
                  placeholder="Relationships to other characters, locations, or events..."
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 'review' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-6 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)]">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-purple)] flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-serif font-bold text-white">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-bold">{name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        status === 'active' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                        status === 'deceased' ? 'bg-gray-500/20 text-gray-400' :
                        status === 'cursed' ? 'bg-[var(--error)]/20 text-[var(--error)]' :
                        status === 'legendary' ? 'bg-[var(--accent-gold)]/20 text-[var(--accent-gold)]' :
                        'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]'
                      }`}>
                        {status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)] mb-1">Traits</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedTraits.map((trait) => (
                        <span key={trait} className="px-2 py-1 bg-[var(--background-tertiary)] rounded text-sm">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)] mb-1">Description</p>
                    <p className="text-sm">{shortDescription}</p>
                  </div>

                  {backstory && (
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground-muted)] mb-1">Backstory</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{backstory}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[var(--accent-gold)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--accent-gold)]">Ready for the Everloop</p>
                    <p className="text-sm text-[var(--foreground-muted)] mt-1">
                      Your character will be added to the glossary and available for use in stories.
                      Other writers can feature them in their tales!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-between p-6 border-t border-[var(--border)] bg-[var(--background)]">
          <button
            onClick={prevStep}
            disabled={step === 'basics'}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          {step === 'review' ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Create Character
                </>
              )}
            </button>
          ) : (
            <button
              onClick={nextStep}
              disabled={!canProceed()}
              className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
