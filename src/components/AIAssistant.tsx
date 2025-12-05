'use client';

import { useState } from 'react';
import {
  Bot,
  Send,
  Lightbulb,
  Search,
  AlertTriangle,
  Sparkles,
  BookOpen,
  MessageSquare,
  Loader2,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  storyId: string;
  storyContent: string;
  canonContext?: {
    arcs?: string[];
    locations?: string[];
    characters?: string[];
    timePeriod?: string;
  };
}

export default function AIAssistant({
  storyId,
  storyContent,
  canonContext,
}: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your writing assistant for Everloop. I can help you with:\n\n• **Canon questions** - Ask about lore, characters, or rules\n• **Writing suggestions** - Get feedback on your prose\n• **Consistency checks** - Verify your story fits the universe\n\nWhat would you like help with?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickActions = [
    {
      icon: Search,
      label: 'Check Canon',
      prompt: 'Can you check if my current scene is consistent with the established canon?',
    },
    {
      icon: Lightbulb,
      label: 'Suggest Ideas',
      prompt: 'Can you suggest some ideas for what could happen next in my story?',
    },
    {
      icon: AlertTriangle,
      label: 'Find Issues',
      prompt: 'Are there any potential continuity issues or problems in my writing?',
    },
    {
      icon: BookOpen,
      label: 'Lore Question',
      prompt: 'Tell me more about the lore relevant to my current story anchors.',
    },
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response - in production, this would call an AI API
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateMockResponse(input, canonContext),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Canon Assistant</h3>
            <p className="text-xs text-[var(--foreground-muted)]">AI-powered writing help</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-[var(--border)]">
        <p className="text-xs text-[var(--foreground-muted)] mb-2">Quick Actions</p>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.prompt)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs bg-[var(--background-tertiary)] hover:bg-[var(--background)] transition-colors text-left"
            >
              <action.icon className="w-3.5 h-3.5 text-[var(--accent-gold)]" />
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg px-3 py-2 ${
                message.role === 'user'
                  ? 'bg-[var(--accent-blue)] text-white'
                  : 'bg-[var(--background-tertiary)] text-[var(--foreground)]'
              }`}
            >
              <div
                className="text-sm prose-sm prose-invert"
                dangerouslySetInnerHTML={{
                  __html: message.content.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
                }}
              />
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-200' : 'text-[var(--foreground-muted)]'
                }`}
              >
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[var(--background-tertiary)] rounded-lg px-3 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--accent-blue)]" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about canon, get suggestions..."
            className="flex-1 text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="btn-primary p-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Mock response generator - would be replaced with actual AI API
function generateMockResponse(
  input: string,
  canonContext?: AIAssistantProps['canonContext']
): string {
  const lowerInput = input.toLowerCase();

  if (lowerInput.includes('canon') || lowerInput.includes('consistent')) {
    return `I've reviewed your current content against the Everloop canon. Here's what I found:\n\n✅ **Character usage** looks consistent with established traits\n✅ **Timeline** appears to align with your selected time period\n\n⚠️ **Suggestion**: Consider adding more sensory details when describing the setting to match the universe's atmospheric style.\n\nWould you like me to elaborate on any of these points?`;
  }

  if (lowerInput.includes('suggest') || lowerInput.includes('ideas') || lowerInput.includes('next')) {
    return `Based on your current narrative, here are some directions you could explore:\n\n1. **Deepen the conflict** - Your protagonist could face an unexpected obstacle that tests their resolve\n\n2. **Introduce a mystery** - A strange occurrence could hint at larger forces at play\n\n3. **Character development** - Show a vulnerable moment that reveals new dimensions\n\n4. **World-building** - Explore a unique aspect of the setting that ties into the plot\n\nWhich direction interests you most?`;
  }

  if (lowerInput.includes('issue') || lowerInput.includes('problem') || lowerInput.includes('find')) {
    return `I've scanned your writing for potential issues:\n\n📝 **Style**: Your prose flows well overall\n\n🔍 **Possible concerns**:\n- Paragraph 2 could use stronger transitions\n- Consider varying sentence length for better rhythm\n\n✨ **Strengths**:\n- Strong dialogue\n- Good pacing\n- Evocative descriptions\n\nWould you like specific suggestions for any of these areas?`;
  }

  if (lowerInput.includes('lore') || lowerInput.includes('tell me')) {
    const context = canonContext
      ? `Based on your story anchors (${canonContext.arcs?.join(', ') || 'no arcs'}, ${canonContext.locations?.join(', ') || 'no locations'}), here's relevant lore:\n\n`
      : '';
    return `${context}The Everloop universe is rich with interconnected histories and mysteries. Each story you write becomes part of this tapestry.\n\n**Key principles**:\n- Actions have consequences that ripple through time\n- Characters maintain consistent traits across stories\n- The rules of the world are immutable\n\nWhat specific aspect would you like to know more about?`;
  }

  return `Thanks for your question! I'm here to help you write stories that fit seamlessly into the Everloop universe.\n\nI can assist with:\n• Checking canon consistency\n• Suggesting story directions\n• Finding potential issues\n• Answering lore questions\n\nWhat would you like to explore?`;
}
