'use client';

import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, MapPin, Sparkles, Check, AlertCircle, Compass } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface LocationCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationCreated: (location: CreatedLocation) => void;
}

export interface CreatedLocation {
  id: string;
  name: string;
  region: string;
  description: string;
}

type WizardStep = 'basics' | 'details' | 'atmosphere' | 'review';

const REGIONS = [
  { value: 'The Heartlands', description: 'The stable center of the world, where most civilization remains.' },
  { value: 'The Shattered Reaches', description: 'Areas most damaged by the Sundering, unstable and dangerous.' },
  { value: 'The Sunken Reaches', description: 'Coastal and underwater territories, drowned by the Sundering.' },
  { value: 'The Driftlands', description: 'Regions where geography itself is unstable and shifts.' },
  { value: 'The High Reaches', description: 'Mountain territories, often home to powerful beings.' },
  { value: 'The Frayed Edges', description: 'Borderlands touching the Fray, reality is thin here.' },
  { value: 'The Quiet Lands', description: 'Mysteriously peaceful areas, perhaps too peaceful.' },
  { value: 'Beyond the Veil', description: 'Locations that exist outside normal reality.' },
  { value: 'Custom Region', description: 'Define your own region.' },
];

const LOCATION_TYPES = [
  { value: 'settlement', label: 'Settlement', icon: '🏘️' },
  { value: 'landmark', label: 'Landmark', icon: '🗿' },
  { value: 'wilderness', label: 'Wilderness', icon: '🌲' },
  { value: 'structure', label: 'Structure', icon: '🏛️' },
  { value: 'ruins', label: 'Ruins', icon: '🏚️' },
  { value: 'sacred', label: 'Sacred Site', icon: '✨' },
  { value: 'dangerous', label: 'Dangerous Zone', icon: '⚠️' },
  { value: 'hidden', label: 'Hidden Place', icon: '👁️' },
];

const ATMOSPHERE_TAGS = [
  'peaceful', 'ominous', 'mysterious', 'ancient', 'vibrant', 'decaying',
  'magical', 'mundane', 'sacred', 'cursed', 'bustling', 'abandoned',
  'isolated', 'connected', 'beautiful', 'horrifying', 'serene', 'chaotic',
  'timeless', 'forgotten', 'dangerous', 'welcoming'
];

export default function LocationCreationWizard({ 
  isOpen, 
  onClose, 
  onLocationCreated 
}: LocationCreationWizardProps) {
  const [step, setStep] = useState<WizardStep>('basics');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [customRegion, setCustomRegion] = useState('');
  const [locationType, setLocationType] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [history, setHistory] = useState('');
  const [significance, setSignificance] = useState('');
  const [atmosphereTags, setAtmosphereTags] = useState<string[]>([]);
  const [dangers, setDangers] = useState('');
  const [inhabitants, setInhabitants] = useState('');

  const steps: { key: WizardStep; label: string }[] = [
    { key: 'basics', label: 'Basics' },
    { key: 'details', label: 'Details' },
    { key: 'atmosphere', label: 'Atmosphere' },
    { key: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex(s => s.key === step);
  const effectiveRegion = region === 'Custom Region' ? customRegion : region;

  const canProceed = () => {
    switch (step) {
      case 'basics':
        return name.trim().length >= 2 && (region !== 'Custom Region' ? region : customRegion.trim().length >= 2);
      case 'details':
        return shortDescription.trim().length >= 10;
      case 'atmosphere':
        return atmosphereTags.length >= 1;
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

  const toggleAtmosphereTag = (tag: string) => {
    if (atmosphereTags.includes(tag)) {
      setAtmosphereTags(atmosphereTags.filter(t => t !== tag));
    } else if (atmosphereTags.length < 5) {
      setAtmosphereTags([...atmosphereTags, tag]);
    }
  };

  const buildFullDescription = () => {
    let description = shortDescription;
    
    if (locationType) {
      const typeLabel = LOCATION_TYPES.find(t => t.value === locationType)?.label || locationType;
      description = `[${typeLabel}] ${description}`;
    }
    
    if (history) {
      description += `\n\nHistory: ${history}`;
    }
    
    if (significance) {
      description += `\n\nSignificance: ${significance}`;
    }
    
    if (inhabitants) {
      description += `\n\nInhabitants: ${inhabitants}`;
    }
    
    if (dangers) {
      description += `\n\nDangers: ${dangers}`;
    }
    
    if (atmosphereTags.length > 0) {
      description += `\n\nAtmosphere: ${atmosphereTags.join(', ')}`;
    }
    
    return description;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const fullDescription = buildFullDescription();

      const { data, error: insertError } = await supabase
        .from('locations')
        .insert({
          name: name.trim(),
          region: effectiveRegion,
          description: fullDescription,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      onLocationCreated({
        id: data.id,
        name: data.name,
        region: data.region,
        description: data.description,
      });

      // Reset form
      setName('');
      setRegion('');
      setCustomRegion('');
      setLocationType('');
      setShortDescription('');
      setHistory('');
      setSignificance('');
      setAtmosphereTags([]);
      setDangers('');
      setInhabitants('');
      setStep('basics');
      onClose();
    } catch (err) {
      console.error('Error creating location:', err);
      setError('Failed to create location. Please try again.');
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
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold">Create New Location</h2>
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
                        ? 'bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)]' 
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
                  Location Name <span className="text-[var(--error)]">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter location name..."
                  className="w-full text-lg"
                  autoFocus
                />
                <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                  Names in Everloop often hint at history or nature: &quot;The Hollow Market,&quot; &quot;Singing Stones,&quot; &quot;The Drowning City.&quot;
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Region <span className="text-[var(--error)]">*</span>
                </label>
                <div className="grid gap-2 max-h-64 overflow-y-auto">
                  {REGIONS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setRegion(r.value)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        region === r.value
                          ? 'border-[var(--accent-purple)] bg-[var(--accent-purple)]/10'
                          : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--accent-purple)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{r.value}</span>
                        {region === r.value && <Check className="w-4 h-4 text-[var(--accent-purple)]" />}
                      </div>
                      <p className="text-sm text-[var(--foreground-muted)] mt-1">{r.description}</p>
                    </button>
                  ))}
                </div>
                
                {region === 'Custom Region' && (
                  <div className="mt-4">
                    <input
                      type="text"
                      value={customRegion}
                      onChange={(e) => setCustomRegion(e.target.value)}
                      placeholder="Enter your custom region name..."
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {LOCATION_TYPES.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setLocationType(locationType === type.value ? '' : type.value)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        locationType === type.value
                          ? 'border-[var(--accent-blue)] bg-[var(--accent-blue)]/10'
                          : 'border-[var(--border)] bg-[var(--background-secondary)] hover:border-[var(--accent-blue)]/50'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{type.icon}</span>
                      <span className="text-sm">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Description <span className="text-[var(--error)]">*</span>
                </label>
                <textarea
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Describe what travelers would see and feel when arriving..."
                  rows={4}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  History <span className="text-[var(--foreground-muted)]">(Optional)</span>
                </label>
                <textarea
                  value={history}
                  onChange={(e) => setHistory(e.target.value)}
                  placeholder="What happened here? What was it before the Sundering?"
                  rows={3}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Significance <span className="text-[var(--foreground-muted)]">(Optional)</span>
                </label>
                <textarea
                  value={significance}
                  onChange={(e) => setSignificance(e.target.value)}
                  placeholder="Why does this place matter? What makes it important?"
                  rows={3}
                  className="w-full"
                />
              </div>
            </div>
          )}

          {/* Step 3: Atmosphere */}
          {step === 'atmosphere' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Atmosphere Tags <span className="text-[var(--foreground-muted)]">({atmosphereTags.length}/5 selected)</span>
                </label>
                <p className="text-sm text-[var(--foreground-muted)] mb-4">
                  Select words that describe the feeling of this place.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {ATMOSPHERE_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleAtmosphereTag(tag)}
                      disabled={atmosphereTags.length >= 5 && !atmosphereTags.includes(tag)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        atmosphereTags.includes(tag)
                          ? 'bg-[var(--accent-purple)] text-white font-medium'
                          : 'bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:bg-[var(--background-tertiary)] disabled:opacity-50'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Inhabitants <span className="text-[var(--foreground-muted)]">(Optional)</span>
                </label>
                <textarea
                  value={inhabitants}
                  onChange={(e) => setInhabitants(e.target.value)}
                  placeholder="Who or what lives here? Travelers, creatures, ghosts?"
                  rows={3}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Known Dangers <span className="text-[var(--foreground-muted)]">(Optional)</span>
                </label>
                <textarea
                  value={dangers}
                  onChange={(e) => setDangers(e.target.value)}
                  placeholder="What threats exist here? Fray instability? Hostile creatures?"
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
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center flex-shrink-0">
                    <Compass className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-serif font-bold">{name}</h3>
                    <p className="text-sm text-[var(--accent-purple)] mt-1">{effectiveRegion}</p>
                    {locationType && (
                      <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-xs bg-[var(--background-tertiary)]">
                        {LOCATION_TYPES.find(t => t.value === locationType)?.icon}{' '}
                        {LOCATION_TYPES.find(t => t.value === locationType)?.label}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-4">
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground-muted)] mb-1">Description</p>
                    <p className="text-sm">{shortDescription}</p>
                  </div>

                  {history && (
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground-muted)] mb-1">History</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{history}</p>
                    </div>
                  )}

                  {significance && (
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground-muted)] mb-1">Significance</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{significance}</p>
                    </div>
                  )}

                  {atmosphereTags.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground-muted)] mb-1">Atmosphere</p>
                      <div className="flex flex-wrap gap-2">
                        {atmosphereTags.map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] rounded text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {inhabitants && (
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground-muted)] mb-1">Inhabitants</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{inhabitants}</p>
                    </div>
                  )}

                  {dangers && (
                    <div>
                      <p className="text-sm font-medium text-[var(--foreground-muted)] mb-1">Dangers</p>
                      <p className="text-sm text-[var(--error)]">{dangers}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[var(--accent-purple)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-[var(--accent-purple)]">Adding to the Map</p>
                    <p className="text-sm text-[var(--foreground-muted)] mt-1">
                      Your location will be added to the Everloop glossary and can be used in stories.
                      Writers can set scenes here and build upon your creation!
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
                  Create Location
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
