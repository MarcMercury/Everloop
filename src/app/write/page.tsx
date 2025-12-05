'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Sparkles, 
  ChevronLeft,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Save,
  Send,
  Loader2,
  BookOpen,
  MapPin,
  Users,
  Clock,
  Plus,
  Wand2,
  Check,
  X,
  Settings,
  FileText,
  AlertTriangle,
  CheckCircle,
  Lightbulb,
  Search,
  RefreshCw,
  Eye,
  History,
  Download,
  Upload,
  Mic,
  Type,
  Palette,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  MoreVertical,
  ChevronDown,
  ChevronUp,
  Bot,
  MessageSquare,
  Quote,
  BookMarked,
  Layers,
  Compass,
  Target,
  GitBranch,
  Feather,
  ScrollText,
  PenTool,
  Edit3,
  Trash2,
  Copy,
  ClipboardPaste,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Image,
  Table,
  HelpCircle,
  Info,
  Keyboard,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Story, StoryMetadata, Arc, Location, Character, TimePeriod, Profile } from '@/types/database';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CanonReviewModal from '@/components/CanonReviewModal';

// Types for our writing tools
interface WritingSuggestion {
  id: string;
  type: 'grammar' | 'style' | 'consistency' | 'lore' | 'continuation' | 'dialogue' | 'description';
  severity: 'info' | 'warning' | 'error';
  title: string;
  description: string;
  originalText?: string;
  suggestedText?: string;
  position?: { from: number; to: number };
  timestamp: Date;
}

interface LoreReference {
  id: string;
  name: string;
  type: 'character' | 'location' | 'artifact' | 'event' | 'faction';
  summary: string;
  inStory: boolean;
}

interface WritingGoal {
  id: string;
  type: 'word_count' | 'time' | 'scene' | 'chapter';
  target: number;
  current: number;
  label: string;
}

interface VersionSnapshot {
  id: string;
  timestamp: Date;
  wordCount: number;
  label?: string;
  content: string;
}

// Loading fallback
function WritingStudioLoading() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <Sparkles className="w-12 h-12 text-[var(--accent-gold)]" />
        <span className="text-[var(--foreground-muted)]">Opening Writing Studio...</span>
      </div>
    </div>
  );
}

// Main component wrapped in suspense
export default function WritingStudioPageWrapper() {
  return (
    <Suspense fallback={<WritingStudioLoading />}>
      <WritingStudioPage />
    </Suspense>
  );
}

function WritingStudioPage() {
  const router = useRouter();
  // Get story ID from URL hash or default to new story
  const [storyId, setStoryId] = useState<string | null>(null);
  
  useEffect(() => {
    // Check for story param in URL
    const params = new URLSearchParams(window.location.search);
    setStoryId(params.get('story'));
  }, []);
  
  // Core state
  const [story, setStory] = useState<Story | null>(null);
  const [metadata, setMetadata] = useState<StoryMetadata | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Panel states
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [leftPanelTab, setLeftPanelTab] = useState<'outline' | 'lore' | 'notes'>('outline');
  const [rightPanelTab, setRightPanelTab] = useState<'assistant' | 'suggestions' | 'history'>('assistant');
  
  // Writing tools state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [ambientSound, setAmbientSound] = useState(false);
  
  // AI & suggestions
  const [suggestions, setSuggestions] = useState<WritingSuggestion[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiMessages, setAiMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Welcome to the Writing Studio! I'm here to help you craft your story. Ask me about lore, request writing suggestions, or let me check your work for consistency." }
  ]);
  
  // Lore & references
  const [loreReferences, setLoreReferences] = useState<LoreReference[]>([]);
  const [searchLore, setSearchLore] = useState('');
  
  // Goals & progress
  const [writingGoals, setWritingGoals] = useState<WritingGoal[]>([
    { id: '1', type: 'word_count', target: 1000, current: 0, label: 'Daily Goal' },
  ]);
  const [sessionStartTime] = useState(new Date());
  const [sessionWordCount, setSessionWordCount] = useState(0);
  
  // Version history
  const [versions, setVersions] = useState<VersionSnapshot[]>([]);
  
  // Canon data
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod | null>(null);
  
  // Canon Review
  const [showCanonReview, setShowCanonReview] = useState(false);
  
  // Notes
  const [notes, setNotes] = useState<string>('');
  
  // Outline
  const [outline, setOutline] = useState<{ id: string; title: string; completed: boolean }[]>([]);
  
  // Refs
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const initialWordCountRef = useRef<number>(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({
        placeholder: 'Begin writing your story...',
      }),
      CharacterCount,
      UnderlineExtension,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: true }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[70vh]',
        style: `font-size: ${fontSize}px; line-height: 1.8;`,
      },
    },
    onUpdate: ({ editor }) => {
      setLastSaved(null);
      const currentWords = getWordCount();
      const sessionWords = currentWords - initialWordCountRef.current;
      setSessionWordCount(Math.max(0, sessionWords));
      setWritingGoals(prev => prev.map(g => 
        g.type === 'word_count' ? { ...g, current: sessionWords } : g
      ));
    },
  });

  // Load story data
  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (profileData) setProfile(profileData);

      if (storyId) {
        // Load existing story
        const { data: storyData, error: storyError } = await supabase
          .from('stories')
          .select('*')
          .eq('id', storyId)
          .single();

        if (storyError || !storyData) {
          router.push('/dashboard');
          return;
        }

        setStory(storyData);
        initialWordCountRef.current = storyData.word_count || 0;
        
        if (editor && storyData.content) {
          editor.commands.setContent(storyData.content);
        }

        // Load metadata
        const { data: metaData } = await supabase
          .from('story_metadata')
          .select('*')
          .eq('story_id', storyId)
          .single();

        if (metaData) {
          setMetadata(metaData);
          await loadCanonData(supabase, metaData);
        }
      }

      // Load lore entries for reference
      const { data: loreData } = await supabase
        .from('characters')
        .select('id, name, description')
        .limit(20);
      
      if (loreData) {
        setLoreReferences(loreData.map(c => ({
          id: c.id,
          name: c.name,
          type: 'character' as const,
          summary: c.description || '',
          inStory: false,
        })));
      }

      setLoading(false);
      setLastSaved(new Date());
    }

    loadData();
  }, [storyId, router, editor]);

  async function loadCanonData(supabase: ReturnType<typeof createClient>, metaData: StoryMetadata) {
    if (metaData.arc_ids?.length) {
      const { data } = await supabase.from('arcs').select('*').in('id', metaData.arc_ids);
      if (data) setArcs(data);
    }
    if (metaData.location_ids?.length) {
      const { data } = await supabase.from('locations').select('*').in('id', metaData.location_ids);
      if (data) setLocations(data);
    }
    if (metaData.character_ids?.length) {
      const { data } = await supabase.from('characters').select('*').in('id', metaData.character_ids);
      if (data) setCharacters(data);
    }
    if (metaData.time_period_id) {
      const { data } = await supabase.from('time_periods').select('*').eq('id', metaData.time_period_id).single();
      if (data) setTimePeriod(data);
    }
  }

  const getWordCount = useCallback(() => {
    if (!editor) return 0;
    const text = editor.getText();
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [editor]);

  const getCharacterCount = useCallback(() => {
    if (!editor) return 0;
    return editor.storage.characterCount?.characters() || 0;
  }, [editor]);

  const saveStory = useCallback(async () => {
    if (!editor || !story) return;
    
    setSaving(true);
    const supabase = createClient();
    const content = editor.getHTML();
    const wordCount = getWordCount();
    
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
      
      // Add to version history
      setVersions(prev => [{
        id: Date.now().toString(),
        timestamp: new Date(),
        wordCount,
        content,
      }, ...prev.slice(0, 19)]); // Keep last 20 versions
    }
    setSaving(false);
  }, [editor, story, getWordCount]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (editor && !lastSaved && story) {
        saveStory();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [editor, lastSaved, saveStory, story]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        saveStory();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'f' && e.shiftKey) {
        e.preventDefault();
        setFocusMode(prev => !prev);
      }
      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveStory, focusMode]);

  // AI Writing Assistant
  const handleAIChat = async () => {
    if (!aiPrompt.trim() || aiLoading) return;
    
    const userMessage = aiPrompt;
    setAiMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiPrompt('');
    setAiLoading(true);

    // Simulate AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    const response = generateAIResponse(userMessage, editor?.getText() || '');
    setAiMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setAiLoading(false);
  };

  const handleQuickAI = async (type: 'continue' | 'dialogue' | 'describe' | 'check' | 'whatif') => {
    setAiLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    let suggestion: WritingSuggestion;
    
    switch (type) {
      case 'continue':
        suggestion = {
          id: Date.now().toString(),
          type: 'continuation',
          severity: 'info',
          title: 'Story Continuation',
          description: 'The threads of fate trembled as she reached deeper into the weave. What she found there—memories not her own, echoes of Weavers long past—sent shivers down her spine. The stones of Verath had witnessed countless bindings, but none quite like this.',
          timestamp: new Date(),
        };
        break;
      case 'dialogue':
        suggestion = {
          id: Date.now().toString(),
          type: 'dialogue',
          severity: 'info',
          title: 'Dialogue Suggestion',
          description: '"You don\'t understand what you\'re asking," the elder Weaver said, his voice trembling. "The Fray doesn\'t just consume—it remembers. Every thread we\'ve lost, every pattern we\'ve broken... it\'s all still there, waiting."',
          timestamp: new Date(),
        };
        break;
      case 'describe':
        suggestion = {
          id: Date.now().toString(),
          type: 'description',
          severity: 'info',
          title: 'Description Enhancement',
          description: 'The chamber stretched impossibly upward, its walls carved with spiraling patterns that seemed to shift when viewed from the corner of the eye. Luminescent fungi clung to the ancient stones, casting everything in a soft, ethereal blue. The air tasted of copper and forgotten oaths.',
          timestamp: new Date(),
        };
        break;
      case 'check':
        suggestion = {
          id: Date.now().toString(),
          type: 'consistency',
          severity: 'warning',
          title: 'Consistency Check',
          description: 'I reviewed your story for canon consistency:\n\n✅ Character traits align with established lore\n✅ Timeline placement is correct\n⚠️ Consider clarifying the shard mechanics in paragraph 3\n\nOverall: Your story fits well within the Everloop universe!',
          timestamp: new Date(),
        };
        break;
      case 'whatif':
        suggestion = {
          id: Date.now().toString(),
          type: 'lore',
          severity: 'info',
          title: 'What If Scenario',
          description: 'What if the protagonist discovers that their mentor was actually a Folded One all along? This could:\n\n• Reframe all previous interactions\n• Create dramatic irony for readers\n• Tie into the Unraveling Arc themes\n\nThis twist is consistent with canon and could add depth to your narrative.',
          timestamp: new Date(),
        };
        break;
    }
    
    setSuggestions(prev => [suggestion, ...prev]);
    setRightPanelTab('suggestions');
    setAiLoading(false);
  };

  const applySuggestion = (suggestion: WritingSuggestion) => {
    if (!editor || !suggestion.suggestedText) return;
    
    if (suggestion.position) {
      editor.chain()
        .focus()
        .setTextSelection(suggestion.position)
        .insertContent(suggestion.suggestedText)
        .run();
    } else {
      editor.chain().focus().insertContent(' ' + (suggestion.description || suggestion.suggestedText)).run();
    }
    
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setLastSaved(null);
  };

  const insertSuggestionAsText = (suggestion: WritingSuggestion) => {
    if (!editor) return;
    editor.chain().focus().insertContent(' ' + suggestion.description).run();
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
    setLastSaved(null);
  };

  const dismissSuggestion = (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
  };

  const handleSubmitForReview = async () => {
    await saveStory();
    setShowCanonReview(true);
  };

  const restoreVersion = (version: VersionSnapshot) => {
    if (!editor) return;
    editor.commands.setContent(version.content);
    setLastSaved(null);
  };

  const exportStory = () => {
    if (!editor || !story) return;
    const content = editor.getText();
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${story.title || 'story'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getSessionDuration = () => {
    const diff = Date.now() - sessionStartTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <Sparkles className="w-12 h-12 text-[var(--accent-gold)]" />
          <span className="text-[var(--foreground-muted)]">Opening Writing Studio...</span>
        </div>
      </div>
    );
  }

  const filteredLore = loreReferences.filter(l => 
    l.name.toLowerCase().includes(searchLore.toLowerCase()) ||
    l.summary.toLowerCase().includes(searchLore.toLowerCase())
  );

  return (
    <div className={`min-h-screen bg-[var(--background)] flex flex-col ${focusMode ? 'focus-mode' : ''}`}>
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

      {/* Top Toolbar */}
      <header className={`sticky top-0 z-50 bg-[var(--background)]/95 backdrop-blur-md border-b border-[var(--border)] transition-all ${focusMode ? 'opacity-0 hover:opacity-100' : ''}`}>
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <button
              onClick={() => setLeftPanelOpen(!leftPanelOpen)}
              className="p-2 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
              title="Toggle left panel"
            >
              {leftPanelOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
            </button>
            <div className="h-6 w-px bg-[var(--border)]" />
            <div className="flex items-center gap-2">
              <Feather className="w-5 h-5 text-[var(--accent-gold)]" />
              <input
                type="text"
                value={story?.title || 'Untitled Story'}
                onChange={(e) => story && setStory({ ...story, title: e.target.value })}
                className="bg-transparent border-none text-lg font-serif font-semibold focus:outline-none focus:ring-0 max-w-[300px]"
              />
            </div>
          </div>

          {/* Center section - Formatting toolbar */}
          <div className="hidden md:flex items-center gap-1 bg-[var(--background-secondary)] rounded-lg p-1">
            <button
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-2 rounded transition-colors ${editor?.isActive('bold') ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'hover:bg-[var(--background-tertiary)]'}`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-2 rounded transition-colors ${editor?.isActive('italic') ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'hover:bg-[var(--background-tertiary)]'}`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`p-2 rounded transition-colors ${editor?.isActive('underline') ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'hover:bg-[var(--background-tertiary)]'}`}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-[var(--border)] mx-1" />
            <button
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-2 rounded transition-colors ${editor?.isActive('bulletList') ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'hover:bg-[var(--background-tertiary)]'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={`p-2 rounded transition-colors ${editor?.isActive('blockquote') ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'hover:bg-[var(--background-tertiary)]'}`}
            >
              <Quote className="w-4 h-4" />
            </button>
            <div className="w-px h-5 bg-[var(--border)] mx-1" />
            <button
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()}
              className="p-2 rounded hover:bg-[var(--background-tertiary)] disabled:opacity-30"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()}
              className="p-2 rounded hover:bg-[var(--background-tertiary)] disabled:opacity-30"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Status indicator */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-[var(--foreground-muted)]">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : lastSaved ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>Unsaved</span>
                </>
              )}
            </div>

            <div className="h-6 w-px bg-[var(--border)]" />

            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`p-2 rounded-lg transition-colors ${focusMode ? 'bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]' : 'hover:bg-[var(--background-secondary)]'}`}
              title="Focus Mode (Ctrl+Shift+F)"
            >
              {focusMode ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>

            <button
              onClick={saveStory}
              className="btn-secondary flex items-center gap-2"
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Save</span>
            </button>

            <button
              onClick={handleSubmitForReview}
              className="btn-primary flex items-center gap-2"
              disabled={!story}
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Submit</span>
            </button>

            <button
              onClick={() => setRightPanelOpen(!rightPanelOpen)}
              className="p-2 rounded-lg hover:bg-[var(--background-secondary)] transition-colors"
              title="Toggle right panel"
            >
              {rightPanelOpen ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Quick AI Actions Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-[var(--background-secondary)]/50 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--foreground-muted)] mr-2">AI Quick Actions:</span>
            <button
              onClick={() => handleQuickAI('continue')}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-gradient-to-r from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 hover:from-[var(--accent-blue)]/30 hover:to-[var(--accent-purple)]/30 transition-all"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Continue
            </button>
            <button
              onClick={() => handleQuickAI('dialogue')}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[var(--background-tertiary)] hover:bg-[var(--background)] transition-all"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Dialogue
            </button>
            <button
              onClick={() => handleQuickAI('describe')}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[var(--background-tertiary)] hover:bg-[var(--background)] transition-all"
            >
              <Palette className="w-3.5 h-3.5" />
              Describe
            </button>
            <button
              onClick={() => handleQuickAI('check')}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[var(--background-tertiary)] hover:bg-[var(--background)] transition-all"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Check
            </button>
            <button
              onClick={() => handleQuickAI('whatif')}
              disabled={aiLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-[var(--background-tertiary)] hover:bg-[var(--background)] transition-all"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              What If?
            </button>
            {aiLoading && <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-blue)]" />}
          </div>
          
          <div className="flex items-center gap-4 text-xs text-[var(--foreground-muted)]">
            <span>{getWordCount().toLocaleString()} words</span>
            <span>{getCharacterCount().toLocaleString()} chars</span>
            <span>{getSessionDuration()} session</span>
            <span className="text-green-400">+{sessionWordCount} today</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Outline, Lore, Notes */}
        {leftPanelOpen && !focusMode && (
          <aside className="w-80 border-r border-[var(--border)] flex flex-col bg-[var(--background-secondary)]/30">
            {/* Panel Tabs */}
            <div className="flex border-b border-[var(--border)]">
              {[
                { id: 'outline', label: 'Outline', icon: Layers },
                { id: 'lore', label: 'Lore', icon: BookOpen },
                { id: 'notes', label: 'Notes', icon: FileText },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setLeftPanelTab(tab.id as typeof leftPanelTab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
                    leftPanelTab === tab.id 
                      ? 'bg-[var(--background)] text-white border-b-2 border-[var(--accent-gold)]' 
                      : 'text-[var(--foreground-muted)] hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {leftPanelTab === 'outline' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Story Outline</h3>
                    <button
                      onClick={() => setOutline([...outline, { id: Date.now().toString(), title: 'New Scene', completed: false }])}
                      className="p-1 rounded hover:bg-[var(--background-tertiary)]"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {outline.length === 0 ? (
                    <div className="text-center py-8 text-[var(--foreground-muted)]">
                      <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No outline yet</p>
                      <p className="text-xs">Add scenes to track your progress</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {outline.map((item, i) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-2 p-2 rounded-lg ${
                            item.completed ? 'bg-green-500/10' : 'bg-[var(--background-tertiary)]'
                          }`}
                        >
                          <button
                            onClick={() => setOutline(outline.map(o => 
                              o.id === item.id ? { ...o, completed: !o.completed } : o
                            ))}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              item.completed ? 'bg-green-500 border-green-500' : 'border-[var(--border)]'
                            }`}
                          >
                            {item.completed && <Check className="w-3 h-3 text-white" />}
                          </button>
                          <span className={`flex-1 text-sm ${item.completed ? 'line-through opacity-60' : ''}`}>
                            {i + 1}. {item.title}
                          </span>
                          <button
                            onClick={() => setOutline(outline.filter(o => o.id !== item.id))}
                            className="p-1 rounded hover:bg-red-500/20 text-red-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Writing Goals */}
                  <div className="mt-6 pt-4 border-t border-[var(--border)]">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-[var(--accent-gold)]" />
                      Writing Goals
                    </h3>
                    {writingGoals.map(goal => (
                      <div key={goal.id} className="mb-3">
                        <div className="flex justify-between text-xs text-[var(--foreground-muted)] mb-1">
                          <span>{goal.label}</span>
                          <span>{Math.min(goal.current, goal.target)}/{goal.target}</span>
                        </div>
                        <div className="h-2 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] transition-all duration-500"
                            style={{ width: `${Math.min(100, (goal.current / goal.target) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {leftPanelTab === 'lore' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground-muted)]" />
                    <input
                      type="text"
                      placeholder="Search lore..."
                      value={searchLore}
                      onChange={(e) => setSearchLore(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 text-sm"
                    />
                  </div>

                  {/* Canon anchors */}
                  {(arcs.length > 0 || locations.length > 0 || characters.length > 0) && (
                    <div className="space-y-3">
                      <h4 className="text-xs uppercase tracking-wide text-[var(--foreground-muted)]">Story Anchors</h4>
                      
                      {arcs.map(arc => (
                        <div key={arc.id} className="p-3 rounded-lg bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Compass className="w-4 h-4 text-[var(--accent-purple)]" />
                            <span className="font-medium text-sm">{arc.name}</span>
                          </div>
                          <p className="text-xs text-[var(--foreground-muted)] line-clamp-2">{arc.description}</p>
                        </div>
                      ))}
                      
                      {locations.map(loc => (
                        <div key={loc.id} className="p-3 rounded-lg bg-[var(--accent-blue)]/10 border border-[var(--accent-blue)]/30">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-[var(--accent-blue)]" />
                            <span className="font-medium text-sm">{loc.name}</span>
                          </div>
                          <p className="text-xs text-[var(--foreground-muted)] line-clamp-2">{loc.description}</p>
                        </div>
                      ))}
                      
                      {characters.map(char => (
                        <div key={char.id} className="p-3 rounded-lg bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30">
                          <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 text-[var(--accent-gold)]" />
                            <span className="font-medium text-sm">{char.name}</span>
                          </div>
                          <p className="text-xs text-[var(--foreground-muted)] line-clamp-2">{char.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Lore search results */}
                  {filteredLore.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <h4 className="text-xs uppercase tracking-wide text-[var(--foreground-muted)]">Reference Library</h4>
                      {filteredLore.map(item => (
                        <button
                          key={item.id}
                          onClick={() => editor?.chain().focus().insertContent(` [[${item.name}]] `).run()}
                          className="w-full text-left p-2 rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
                        >
                          <span className="font-medium text-sm">{item.name}</span>
                          <p className="text-xs text-[var(--foreground-muted)] line-clamp-1">{item.summary}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {leftPanelTab === 'notes' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Story Notes
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Jot down ideas, reminders, or notes for your story..."
                    className="w-full h-[400px] resize-none text-sm"
                  />
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Editor Area */}
        <main 
          ref={editorContainerRef}
          className={`flex-1 overflow-y-auto ${focusMode ? 'max-w-3xl mx-auto' : ''}`}
        >
          <div className={`max-w-4xl mx-auto px-8 py-12 ${focusMode ? 'max-w-3xl' : ''}`}>
            <EditorContent 
              editor={editor} 
              className="min-h-[70vh]"
            />
          </div>
        </main>

        {/* Right Panel - AI Assistant, Suggestions, History */}
        {rightPanelOpen && !focusMode && (
          <aside className="w-96 border-l border-[var(--border)] flex flex-col bg-[var(--background-secondary)]/30">
            {/* Panel Tabs */}
            <div className="flex border-b border-[var(--border)]">
              {[
                { id: 'assistant', label: 'Assistant', icon: Bot },
                { id: 'suggestions', label: 'Suggestions', icon: Lightbulb, count: suggestions.length },
                { id: 'history', label: 'History', icon: History },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRightPanelTab(tab.id as typeof rightPanelTab)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors relative ${
                    rightPanelTab === tab.id 
                      ? 'bg-[var(--background)] text-white border-b-2 border-[var(--accent-gold)]' 
                      : 'text-[var(--foreground-muted)] hover:text-white'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.count && tab.count > 0 && (
                    <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--accent-gold)] text-xs flex items-center justify-center text-black font-bold">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {rightPanelTab === 'assistant' && (
                <div className="flex flex-col h-full">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {aiMessages.map((msg, i) => (
                      <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] rounded-lg px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-[var(--accent-blue)] text-white'
                            : 'bg-[var(--background-tertiary)]'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {aiLoading && (
                      <div className="flex justify-start">
                        <div className="bg-[var(--background-tertiary)] rounded-lg px-4 py-3">
                          <Loader2 className="w-5 h-5 animate-spin text-[var(--accent-blue)]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-[var(--border)]">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAIChat()}
                        placeholder="Ask about lore, get suggestions..."
                        className="flex-1 text-sm"
                      />
                      <button
                        onClick={handleAIChat}
                        disabled={!aiPrompt.trim() || aiLoading}
                        className="btn-primary p-2 disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {rightPanelTab === 'suggestions' && (
                <div className="p-4 space-y-3">
                  {suggestions.length === 0 ? (
                    <div className="text-center py-12 text-[var(--foreground-muted)]">
                      <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No suggestions yet</p>
                      <p className="text-sm mt-1">Use the AI Quick Actions to generate suggestions</p>
                    </div>
                  ) : (
                    suggestions.map(suggestion => (
                      <div
                        key={suggestion.id}
                        className={`p-4 rounded-lg border ${
                          suggestion.severity === 'error' 
                            ? 'bg-red-500/10 border-red-500/30'
                            : suggestion.severity === 'warning'
                            ? 'bg-yellow-500/10 border-yellow-500/30'
                            : 'bg-[var(--background-tertiary)] border-[var(--border)]'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {suggestion.type === 'consistency' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                            {suggestion.type === 'continuation' && <Wand2 className="w-4 h-4 text-[var(--accent-purple)]" />}
                            {suggestion.type === 'dialogue' && <MessageSquare className="w-4 h-4 text-[var(--accent-blue)]" />}
                            {suggestion.type === 'description' && <Palette className="w-4 h-4 text-green-500" />}
                            {suggestion.type === 'lore' && <BookOpen className="w-4 h-4 text-[var(--accent-gold)]" />}
                            <span className="font-medium text-sm">{suggestion.title}</span>
                          </div>
                          <button
                            onClick={() => dismissSuggestion(suggestion.id)}
                            className="p-1 rounded hover:bg-[var(--background)] text-[var(--foreground-muted)]"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-sm text-[var(--foreground-muted)] whitespace-pre-wrap mb-3">
                          {suggestion.description}
                        </p>
                        <div className="flex gap-2">
                          {(suggestion.type === 'continuation' || suggestion.type === 'dialogue' || suggestion.type === 'description') && (
                            <button
                              onClick={() => insertSuggestionAsText(suggestion)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-[var(--accent-blue)] text-white hover:opacity-90 transition-opacity"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Insert
                            </button>
                          )}
                          <button
                            onClick={() => dismissSuggestion(suggestion.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs bg-[var(--background)] hover:bg-[var(--background-secondary)] transition-colors"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {rightPanelTab === 'history' && (
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-sm">Version History</h3>
                    <button onClick={exportStory} className="text-xs text-[var(--accent-blue)] hover:underline flex items-center gap-1">
                      <Download className="w-3.5 h-3.5" />
                      Export
                    </button>
                  </div>
                  
                  {versions.length === 0 ? (
                    <div className="text-center py-12 text-[var(--foreground-muted)]">
                      <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No versions yet</p>
                      <p className="text-sm mt-1">Versions are saved automatically</p>
                    </div>
                  ) : (
                    versions.map((version, i) => (
                      <div
                        key={version.id}
                        className="p-3 rounded-lg bg-[var(--background-tertiary)] hover:bg-[var(--background)] transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium">
                              {version.label || `Version ${versions.length - i}`}
                            </p>
                            <p className="text-xs text-[var(--foreground-muted)]">
                              {version.timestamp.toLocaleTimeString()} • {version.wordCount} words
                            </p>
                          </div>
                          <button
                            onClick={() => restoreVersion(version)}
                            className="opacity-0 group-hover:opacity-100 text-xs text-[var(--accent-blue)] hover:underline transition-opacity"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Focus Mode Overlay */}
      {focusMode && (
        <button
          onClick={() => setFocusMode(false)}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-[var(--background-secondary)] border border-[var(--border)] shadow-lg hover:bg-[var(--background-tertiary)] transition-all"
          title="Exit Focus Mode"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <style jsx global>{`
        .focus-mode .ProseMirror {
          max-width: 65ch;
          margin: 0 auto;
        }
        
        .focus-mode {
          --background: #0a0a0a;
        }
      `}</style>
    </div>
  );
}

// AI Response Generator (mock)
function generateAIResponse(input: string, storyContent: string): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('canon') || lowerInput.includes('consistent') || lowerInput.includes('check')) {
    return `I've analyzed your story for canon consistency. Here's my review:

✅ **Character Behavior**: Actions align with established personality traits
✅ **Timeline**: Events are properly sequenced within the Everloop chronology
✅ **World Rules**: Magic/shard mechanics are used correctly

💡 **Suggestions**:
• Consider adding more sensory details to ground readers in the setting
• The dialogue in the middle section could use more emotional depth

Would you like me to elaborate on any of these points?`;
  }

  if (lowerInput.includes('continue') || lowerInput.includes('next') || lowerInput.includes('what happens')) {
    return `Based on your narrative direction, here are some possibilities:

1. **Escalate the Tension**: Introduce an unexpected complication that tests your protagonist
2. **Reveal Hidden Information**: A secret comes to light that changes everything
3. **Deepen Relationships**: A quiet moment of connection before the storm
4. **Worldbuilding Opportunity**: Show a unique aspect of the Everloop universe

Which direction interests you most? I can provide specific continuation text for any of these.`;
  }

  if (lowerInput.includes('help') || lowerInput.includes('stuck') || lowerInput.includes("don't know")) {
    return `Writer's block happens to everyone! Here are some techniques:

🎯 **Quick Exercises**:
• Write the next scene from a different character's POV
• Skip ahead to a scene you're excited about
• Describe the setting using only sounds and smells

📝 **Story Questions to Explore**:
• What does your protagonist fear most right now?
• What's the worst thing that could happen in this scene?
• What secret is someone keeping?

Would you like me to generate some specific prompts based on your current story?`;
  }

  if (lowerInput.includes('lore') || lowerInput.includes('world') || lowerInput.includes('universe')) {
    return `The Everloop universe has deep lore to draw from:

🌌 **Core Concepts**:
• **The Weave**: The fabric of reality that Weavers manipulate
• **The Fray**: The chaotic void that threatens to unmake existence
• **Shards**: Crystallized moments of power with unique properties

📚 **Key Factions**:
• Keepers of the Loom
• The Folded Ones
• Drift Walkers

What aspect of the lore would you like to explore for your story?`;
  }

  return `I'm here to help with your writing! I can:

• **Check consistency** with Everloop canon
• **Generate continuations** based on your story
• **Suggest dialogue** for your characters
• **Describe settings** in evocative detail
• **Answer lore questions** about the universe
• **Help with writer's block** with prompts and exercises

What would you like to work on?`;
}
