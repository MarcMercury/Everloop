'use client';

import { useEffect, useState, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  ChevronLeft,
  ChevronRight,
  PanelRightOpen,
  PanelRightClose,
  Save,
  Send,
  Loader2,
  BookOpen,
  MapPin,
  Users,
  Clock,
  Layers,
  Plus,
  MessageSquare,
  Wand2,
  HelpCircle,
  Check,
  X,
  Menu
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Story, StoryMetadata, Arc, Location, Character, TimePeriod } from '@/types/database';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CanonReviewModal from '@/components/CanonReviewModal';

interface AISuggestion {
  id: string;
  type: 'continuation' | 'dialogue' | 'description' | 'answer';
  content: string;
  timestamp: Date;
}

export default function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [story, setStory] = useState<Story | null>(null);
  const [metadata, setMetadata] = useState<StoryMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Panel states
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // AI Assistant
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  // Canon data
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod | null>(null);
  
  // Canon Review
  const [showCanonReview, setShowCanonReview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Begin your story here...',
      }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'tiptap prose prose-invert max-w-none focus:outline-none min-h-[500px] lg:min-h-[600px]',
      },
    },
    onUpdate: ({ editor }) => {
      // Mark as unsaved
      setLastSaved(null);
    },
  });

  const saveStory = useCallback(async () => {
    if (!editor || !story) return;
    
    setSaving(true);
    const supabase = createClient();
    const content = editor.getHTML();
    const textContent = editor.getText();
    const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
    
    const { error } = await supabase
      .from('stories')
      .update({
        content,
        word_count: wordCount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', story.id);

    if (!error) {
      setLastSaved(new Date());
      setStory({ ...story, content, word_count: wordCount });
    }
    setSaving(false);
  }, [editor, story]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (editor && !lastSaved) {
        saveStory();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [editor, lastSaved, saveStory]);

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveStory();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveStory]);

  useEffect(() => {
    async function loadStory() {
      const supabase = createClient();
      
      // Load story
      const { data: storyData, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (storyError || !storyData) {
        router.push('/dashboard');
        return;
      }

      setStory(storyData);
      if (editor && storyData.content) {
        editor.commands.setContent(storyData.content);
      }

      // Load metadata
      const { data: metaData } = await supabase
        .from('story_metadata')
        .select('*')
        .eq('story_id', resolvedParams.id)
        .single();

      if (metaData) {
        setMetadata(metaData);

        // Load related canon data
        if (metaData.arc_ids && metaData.arc_ids.length > 0) {
          const { data: arcsData } = await supabase
            .from('arcs')
            .select('*')
            .in('id', metaData.arc_ids);
          if (arcsData) setArcs(arcsData);
        }

        if (metaData.location_ids && metaData.location_ids.length > 0) {
          const { data: locationsData } = await supabase
            .from('locations')
            .select('*')
            .in('id', metaData.location_ids);
          if (locationsData) setLocations(locationsData);
        }

        if (metaData.character_ids && metaData.character_ids.length > 0) {
          const { data: charactersData } = await supabase
            .from('characters')
            .select('*')
            .in('id', metaData.character_ids);
          if (charactersData) setCharacters(charactersData);
        }

        if (metaData.time_period_id) {
          const { data: periodData } = await supabase
            .from('time_periods')
            .select('*')
            .eq('id', metaData.time_period_id)
            .single();
          if (periodData) setTimePeriod(periodData);
        }
      }

      setLoading(false);
      setLastSaved(new Date());
    }

    loadStory();
  }, [resolvedParams.id, router, editor]);

  const handleAIRequest = async (type: 'continue' | 'dialogue' | 'describe' | 'question') => {
    if (!editor) return;
    
    setAiLoading(true);
    
    // Simulate AI response (in production, this would call your AI API)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const currentText = editor.getText().slice(-500); // Last 500 chars for context
    
    let suggestion: AISuggestion;
    
    switch (type) {
      case 'continue':
        suggestion = {
          id: Date.now().toString(),
          type: 'continuation',
          content: 'The threads of fate trembled as she reached deeper into the weave. What she found there—memories not her own, echoes of Weavers long past—sent shivers down her spine. The stones of Verath had witnessed countless bindings, but none quite like this.',
          timestamp: new Date(),
        };
        break;
      case 'dialogue':
        suggestion = {
          id: Date.now().toString(),
          type: 'dialogue',
          content: '"You don\'t understand what you\'re asking," the elder Weaver said, his voice trembling. "The Fray doesn\'t just consume—it remembers. Every thread we\'ve lost, every pattern we\'ve broken... it\'s all still there, waiting."',
          timestamp: new Date(),
        };
        break;
      case 'describe':
        suggestion = {
          id: Date.now().toString(),
          type: 'description',
          content: 'The chamber stretched impossibly upward, its walls carved with spiraling patterns that seemed to shift when viewed from the corner of the eye. Luminescent fungi clung to the ancient stones, casting everything in a soft, ethereal blue. The air tasted of copper and forgotten oaths.',
          timestamp: new Date(),
        };
        break;
      case 'question':
        suggestion = {
          id: Date.now().toString(),
          type: 'answer',
          content: aiPrompt ? `Based on Everloop lore: ${aiPrompt}\n\nIn the established canon, this would relate to the Weaver's fundamental connection to the Cosmic Loom. Remember that all Weavers must have either the Gift or a binding pact to manipulate the threads of reality.` : 'Ask me a question about Everloop lore, and I\'ll provide guidance based on the established canon.',
          timestamp: new Date(),
        };
        break;
    }
    
    setAiSuggestions([suggestion, ...aiSuggestions]);
    setAiLoading(false);
    setAiPrompt('');
  };

  const addToStory = async (suggestion: AISuggestion) => {
    if (!editor || !story) return;
    
    // Insert at cursor position or end
    editor.chain().focus().insertContent(' ' + suggestion.content).run();
    
    // Log the commit
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      await supabase.from('ai_commit_logs').insert({
        story_id: story.id,
        user_id: user.id,
        ai_suggestion_snippet: suggestion.content.slice(0, 500),
      });
    }
    
    // Remove from suggestions
    setAiSuggestions(aiSuggestions.filter(s => s.id !== suggestion.id));
    
    // Trigger save
    setLastSaved(null);
  };

  const dismissSuggestion = (id: string) => {
    setAiSuggestions(aiSuggestions.filter(s => s.id !== id));
  };

  const handleSubmitForReview = async () => {
    await saveStory();
    setShowCanonReview(true);
  };

  const getWordCount = () => {
    if (!editor) return 0;
    const text = editor.getText();
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-[var(--accent-gold)]" />
          <span className="text-[var(--foreground-muted)]">Loading editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col">
      {showCanonReview && story && (
        <CanonReviewModal
          story={story}
          onClose={() => setShowCanonReview(false)}
          onStatusChange={(newStatus) => {
            setStory({ ...story, status: newStatus });
            setShowCanonReview(false);
          }}
        />
      )}

      {/* Editor Sub-header */}
      <div className="bg-[var(--background-secondary)] border-b border-[var(--border)]">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-white transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="h-5 w-px bg-[var(--border)]" />
              <h1 className="font-serif font-medium truncate max-w-[200px] sm:max-w-none text-sm">
                {story?.title || 'Untitled Story'}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Save indicator */}
              <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--foreground-muted)]">
                {saving ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="w-3 h-3 text-[var(--success)]" />
                    <span>Saved</span>
                  </>
                ) : (
                  <span>Unsaved</span>
                )}
              </div>
              
              <button
                onClick={saveStory}
                disabled={saving}
                className="btn-secondary py-1.5 px-2.5 text-sm flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Save</span>
              </button>
              
              <button
                onClick={handleSubmitForReview}
                className="btn-primary py-1.5 px-2.5 text-sm flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Canon Check</span>
              </button>
              
              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 text-[var(--foreground-muted)] hover:text-white"
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Story Structure & Anchors */}
        <aside className={`${leftPanelOpen ? 'w-64' : 'w-0'} hidden lg:block border-r border-[var(--border)] bg-[var(--background-secondary)] transition-all overflow-hidden`}>
          <div className="w-64 h-full overflow-y-auto p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Story Info</h2>
              <button
                onClick={() => setLeftPanelOpen(false)}
                className="text-[var(--foreground-muted)] hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* Story metadata */}
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide">Type</label>
                <p className="capitalize">{story?.type}-form Story</p>
              </div>

              <div>
                <label className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide">Status</label>
                <p className="capitalize">{story?.status.replace('_', ' ')}</p>
              </div>

              <div>
                <label className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide">Word Count</label>
                <p>{getWordCount().toLocaleString()}</p>
              </div>

              {arcs.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className="w-4 h-4 text-[var(--accent-blue)]" />
                    <label className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide">Arcs</label>
                  </div>
                  <div className="space-y-1">
                    {arcs.map(arc => (
                      <div key={arc.id} className="text-sm px-2 py-1 rounded bg-[var(--background-tertiary)]">
                        {arc.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {locations.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-[var(--accent-purple)]" />
                    <label className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide">Locations</label>
                  </div>
                  <div className="space-y-1">
                    {locations.map(loc => (
                      <div key={loc.id} className="text-sm px-2 py-1 rounded bg-[var(--background-tertiary)]">
                        {loc.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {characters.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-[var(--accent-gold)]" />
                    <label className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide">Characters</label>
                  </div>
                  <div className="space-y-1">
                    {characters.map(char => (
                      <div key={char.id} className="text-sm px-2 py-1 rounded bg-[var(--background-tertiary)]">
                        {char.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {timePeriod && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-[var(--success)]" />
                    <label className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide">Time Period</label>
                  </div>
                  <div className="text-sm px-2 py-1 rounded bg-[var(--background-tertiary)]">
                    {timePeriod.name}
                  </div>
                </div>
              )}

              {metadata?.connection_note && (
                <div>
                  <label className="text-xs text-[var(--foreground-muted)] uppercase tracking-wide">Connection Note</label>
                  <p className="text-sm text-[var(--foreground-muted)] mt-1">{metadata.connection_note}</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Toggle left panel button (when closed) */}
        {!leftPanelOpen && (
          <button
            onClick={() => setLeftPanelOpen(true)}
            className="hidden lg:flex fixed left-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-[var(--background-secondary)] border border-[var(--border)] rounded-r-lg text-[var(--foreground-muted)] hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Main Editor */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8">
            {/* Title input */}
            <input
              type="text"
              value={story?.title || ''}
              onChange={(e) => {
                if (story) {
                  setStory({ ...story, title: e.target.value });
                  setLastSaved(null);
                }
              }}
              onBlur={async () => {
                if (story) {
                  const supabase = createClient();
                  await supabase
                    .from('stories')
                    .update({ title: story.title })
                    .eq('id', story.id);
                }
              }}
              placeholder="Story Title"
              className="w-full text-3xl sm:text-4xl font-serif font-bold bg-transparent border-none focus:ring-0 p-0 mb-8 placeholder:text-[var(--foreground-muted)]"
            />

            {/* Editor */}
            <EditorContent editor={editor} />
          </div>
        </main>

        {/* Right Sidebar - AI Assistant */}
        <aside className={`${aiPanelOpen ? 'w-80' : 'w-0'} hidden lg:block border-l border-[var(--border)] bg-[var(--background-tertiary)] transition-all overflow-hidden`}>
          <div className="w-80 h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--accent-gold)]" />
                <h2 className="font-semibold">AI Assistant</h2>
              </div>
              <button
                onClick={() => setAiPanelOpen(false)}
                className="text-[var(--foreground-muted)] hover:text-white"
              >
                <PanelRightClose className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-[var(--border)]">
              <p className="text-xs text-[var(--foreground-muted)] mb-3">Quick suggestions</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAIRequest('continue')}
                  disabled={aiLoading}
                  className="p-2 text-sm rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--accent-blue)] transition-colors flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4 text-[var(--accent-blue)]" />
                  Continue
                </button>
                <button
                  onClick={() => handleAIRequest('dialogue')}
                  disabled={aiLoading}
                  className="p-2 text-sm rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--accent-purple)] transition-colors flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-[var(--accent-purple)]" />
                  Dialogue
                </button>
                <button
                  onClick={() => handleAIRequest('describe')}
                  disabled={aiLoading}
                  className="p-2 text-sm rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--accent-gold)] transition-colors flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-[var(--accent-gold)]" />
                  Describe
                </button>
                <button
                  onClick={() => handleAIRequest('question')}
                  disabled={aiLoading}
                  className="p-2 text-sm rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] hover:border-[var(--success)] transition-colors flex items-center gap-2"
                >
                  <HelpCircle className="w-4 h-4 text-[var(--success)]" />
                  Ask Lore
                </button>
              </div>
            </div>

            {/* Question input */}
            <div className="p-4 border-b border-[var(--border)]">
              <div className="relative">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && aiPrompt.trim()) {
                      handleAIRequest('question');
                    }
                  }}
                  placeholder="Ask about Everloop lore..."
                  className="pr-10 text-sm"
                />
                <button
                  onClick={() => aiPrompt.trim() && handleAIRequest('question')}
                  disabled={!aiPrompt.trim() || aiLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] hover:text-white disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Suggestions */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {aiLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[var(--accent-gold)]" />
                </div>
              )}

              {aiSuggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] animate-fade-in"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[var(--foreground-muted)] capitalize">{suggestion.type}</span>
                    <button
                      onClick={() => dismissSuggestion(suggestion.id)}
                      className="text-[var(--foreground-muted)] hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm italic mb-4 text-[var(--foreground)]">
                    {suggestion.content}
                  </p>
                  <button
                    onClick={() => addToStory(suggestion)}
                    className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add to Story
                  </button>
                </div>
              ))}

              {!aiLoading && aiSuggestions.length === 0 && (
                <div className="text-center py-8 text-[var(--foreground-muted)]">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Use the buttons above to get AI suggestions that fit the Everloop universe.</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Toggle AI panel button (when closed) */}
        {!aiPanelOpen && (
          <button
            onClick={() => setAiPanelOpen(true)}
            className="hidden lg:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 p-2 bg-[var(--background-tertiary)] border border-[var(--border)] rounded-l-lg text-[var(--foreground-muted)] hover:text-white"
          >
            <PanelRightOpen className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Bottom Sheet for AI (simplified) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-[var(--background-secondary)] rounded-t-xl max-h-[70vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[var(--accent-gold)]" />
                  <h2 className="font-semibold">AI Assistant</h2>
                </div>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => { handleAIRequest('continue'); }}
                  disabled={aiLoading}
                  className="p-3 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] flex items-center gap-2"
                >
                  <Wand2 className="w-4 h-4 text-[var(--accent-blue)]" />
                  Continue
                </button>
                <button
                  onClick={() => { handleAIRequest('dialogue'); }}
                  disabled={aiLoading}
                  className="p-3 text-sm rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)] flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-[var(--accent-purple)]" />
                  Dialogue
                </button>
              </div>

              {/* Suggestions */}
              <div className="space-y-3">
                {aiSuggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="p-3 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]"
                  >
                    <p className="text-sm italic mb-3">{suggestion.content}</p>
                    <button
                      onClick={() => { addToStory(suggestion); setMobileMenuOpen(false); }}
                      className="btn-primary w-full py-2 text-sm flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add to Story
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
