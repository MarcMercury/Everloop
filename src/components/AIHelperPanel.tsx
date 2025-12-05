'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Wand2,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Plus,
  RefreshCw,
  MessageSquare,
  BookOpen,
  Edit3,
  Loader2,
  X,
  Send,
} from 'lucide-react';
import { 
  AIContext, 
  AIIntent, 
  ScreenType, 
  requestAIAssistance,
  CANON_RULES,
} from '@/lib/ai/context';

interface AIHelperPanelProps {
  screenType: ScreenType;
  userContent: string;
  selectedText?: string;
  canonContext?: {
    activeCharacters?: string[];
    activeLocations?: string[];
    activeLore?: string[];
    storyArc?: string;
    timePeriod?: string;
  };
  onInsert?: (text: string) => void;
  onReplace?: (text: string) => void;
}

interface GenerateOption {
  id: AIIntent;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const GENERATE_OPTIONS: GenerateOption[] = [
  { id: 'continue_story', label: 'Continue Story', icon: Wand2, description: 'Write the next part' },
  { id: 'expand_paragraph', label: 'Elaborate', icon: Plus, description: 'Add more detail' },
  { id: 'add_description', label: 'Description', icon: BookOpen, description: 'Evocative details' },
  { id: 'add_dialogue', label: 'Dialogue', icon: MessageSquare, description: 'Character speech' },
  { id: 'suggest_ideas', label: 'Suggest Ideas', icon: Sparkles, description: 'Plot directions' },
];

const CANON_OPTIONS: GenerateOption[] = [
  { id: 'check_consistency', label: 'Lore Check', icon: Check, description: 'Verify against canon' },
  { id: 'explain_lore', label: 'Explain Lore', icon: BookOpen, description: 'Understand elements' },
];

const REVISION_OPTIONS: GenerateOption[] = [
  { id: 'fix_prose', label: 'Tighten Prose', icon: Edit3, description: 'Improve writing' },
];

export default function AIHelperPanel({
  screenType,
  userContent,
  selectedText,
  canonContext = {},
  onInsert,
  onReplace,
}: AIHelperPanelProps) {
  const [activeSection, setActiveSection] = useState<'generate' | 'canon' | 'revision' | 'chat'>('generate');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<{ content: string; insertable: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your Everloop writing assistant. I know the universe deeply and can help you create canon-consistent content. What would you like to work on?" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAction = async (intent: AIIntent) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    const context: AIContext = {
      screenType,
      userContent,
      selectedText,
      canonContext: {
        universe: 'Everloop',
        ...canonContext,
        rules: CANON_RULES,
      },
      intent,
    };

    try {
      const result = await requestAIAssistance({ context });
      setResponse(result);
    } catch (err) {
      setError('Failed to get AI response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || loading) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setLoading(true);

    const context: AIContext = {
      screenType,
      userContent,
      selectedText,
      canonContext: {
        universe: 'Everloop',
        ...canonContext,
        rules: CANON_RULES,
      },
      intent: 'general_help',
      additionalContext: { userQuery: userMessage },
    };

    try {
      const result = await requestAIAssistance({ context });
      setChatMessages(prev => [...prev, { role: 'assistant', content: result.content }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble right now. Could you try again?" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = () => {
    if (response?.content && onInsert) {
      onInsert(response.content);
      setResponse(null);
    }
  };

  const handleCopy = async () => {
    if (response?.content) {
      await navigator.clipboard.writeText(response.content);
    }
  };

  const renderOptions = (options: GenerateOption[]) => (
    <div className="space-y-1">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => handleAction(option.id)}
          disabled={loading}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--background)] hover:bg-[var(--background-tertiary)] transition-colors text-left group"
        >
          <div className="p-1.5 rounded-md bg-[var(--accent-gold)]/10 group-hover:bg-[var(--accent-gold)]/20 transition-colors">
            <option.icon className="w-4 h-4 text-[var(--accent-gold)]" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white">{option.label}</div>
            <div className="text-xs text-[var(--foreground-muted)] truncate">{option.description}</div>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-[var(--background-secondary)] border-l border-[var(--border)]">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-purple)] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-white">AI Assistant</h3>
            <p className="text-xs text-[var(--foreground-muted)]">Canon-aware writing help</p>
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1 bg-[var(--background)] rounded-lg p-1">
          {[
            { id: 'generate', label: 'Generate' },
            { id: 'canon', label: 'Canon' },
            { id: 'revision', label: 'Revise' },
            { id: 'chat', label: 'Chat' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeSection === tab.id
                  ? 'bg-[var(--accent-gold)] text-black'
                  : 'text-[var(--foreground-muted)] hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeSection === 'generate' && (
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-xs font-medium text-[var(--foreground-muted)] mb-2 uppercase tracking-wide">Generate Content</h4>
              {renderOptions(GENERATE_OPTIONS)}
            </div>
          </div>
        )}

        {activeSection === 'canon' && (
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-xs font-medium text-[var(--foreground-muted)] mb-2 uppercase tracking-wide">Canon Tools</h4>
              {renderOptions(CANON_OPTIONS)}
            </div>

            {/* Quick Canon Reference */}
            <div className="pt-4 border-t border-[var(--border)]">
              <h4 className="text-xs font-medium text-[var(--foreground-muted)] mb-2 uppercase tracking-wide">Canon Rules</h4>
              <div className="space-y-2">
                {CANON_RULES.slice(0, 5).map((rule, i) => (
                  <div key={i} className="text-xs text-[var(--foreground-muted)] flex items-start gap-2">
                    <span className="text-[var(--accent-gold)]">•</span>
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'revision' && (
          <div className="p-4 space-y-4">
            <div>
              <h4 className="text-xs font-medium text-[var(--foreground-muted)] mb-2 uppercase tracking-wide">Revision Tools</h4>
              {renderOptions(REVISION_OPTIONS)}
            </div>

            {/* Selection Status */}
            <div className="pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2 text-xs">
                {selectedText ? (
                  <>
                    <Check className="w-3 h-3 text-green-400" />
                    <span className="text-[var(--foreground-muted)]">
                      {selectedText.length} characters selected
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 text-amber-400" />
                    <span className="text-[var(--foreground-muted)]">
                      Select text to revise
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'chat' && (
          <div className="flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      msg.role === 'user'
                        ? 'bg-[var(--accent-blue)] text-white'
                        : 'bg-[var(--background)] text-[var(--foreground)]'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-[var(--background)] rounded-lg px-3 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-gold)]" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-3 border-t border-[var(--border)]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                  placeholder="Ask about lore, get suggestions..."
                  className="flex-1 px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
                />
                <button
                  onClick={handleChatSend}
                  disabled={loading || !chatInput.trim()}
                  className="p-2 bg-[var(--accent-gold)] text-black rounded-lg hover:bg-[var(--accent-gold)]/90 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Response Display */}
      {response && activeSection !== 'chat' && (
        <div className="border-t border-[var(--border)] p-4 bg-[var(--background)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-[var(--foreground-muted)]">AI Response</span>
            <button onClick={() => setResponse(null)} className="text-[var(--foreground-muted)] hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-[var(--background-secondary)] rounded-lg p-3 mb-3 max-h-48 overflow-y-auto">
            <p className="text-sm text-white whitespace-pre-wrap">{response.content}</p>
          </div>
          <div className="flex gap-2">
            {response.insertable && onInsert && (
              <button
                onClick={handleInsert}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[var(--accent-gold)] text-black rounded-lg text-sm font-medium hover:bg-[var(--accent-gold)]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Insert into Story
              </button>
            )}
            <button
              onClick={handleCopy}
              className="px-3 py-2 bg-[var(--background-secondary)] text-white rounded-lg text-sm hover:bg-[var(--background-tertiary)] transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleAction(response.insertable ? 'continue_story' : 'suggest_ideas')}
              className="px-3 py-2 bg-[var(--background-secondary)] text-white rounded-lg text-sm hover:bg-[var(--background-tertiary)] transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && activeSection !== 'chat' && (
        <div className="border-t border-[var(--border)] p-4 flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-gold)]" />
          <span className="text-sm text-[var(--foreground-muted)]">Generating...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="border-t border-[var(--border)] p-4 bg-red-500/10">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
