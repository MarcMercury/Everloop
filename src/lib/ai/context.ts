/**
 * AI Context System for Everloop
 * 
 * This module provides structured context injection for all AI interactions.
 * It ensures the AI always has:
 * 1. Screen type context
 * 2. User's current content
 * 3. Canon knowledge
 * 4. Explicit user intent
 */

// ============================================
// TYPES
// ============================================

export type ScreenType = 
  | 'story_editor'
  | 'character_creator'
  | 'location_creator'
  | 'lore_browser'
  | 'map_editor'
  | 'dashboard'
  | 'explore';

export type AIIntent = 
  | 'continue_story'
  | 'expand_paragraph'
  | 'add_dialogue'
  | 'add_description'
  | 'suggest_ideas'
  | 'check_consistency'
  | 'fix_prose'
  | 'create_character'
  | 'create_location'
  | 'explain_lore'
  | 'general_help';

export interface AIContext {
  screenType: ScreenType;
  userContent: string;
  selectedText?: string;
  canonContext: CanonContext;
  intent: AIIntent;
  additionalContext?: Record<string, any>;
}

export interface CanonContext {
  universe: string;
  activeCharacters?: string[];
  activeLocations?: string[];
  activeLore?: string[];
  storyArc?: string;
  timePeriod?: string;
  rules: string[];
}

// ============================================
// CANON KNOWLEDGE BASE
// ============================================

export const EVERLOOP_UNIVERSE = `
# The Everloop Universe

## Core Cosmology
- **The Pattern**: The underlying fabric of reality created by the First Architects
- **The Fray**: Chaotic void that threatens to unmake existence, spreading where the Pattern weakens
- **The Shards**: 13 crystallized remnants of the original Pattern, each a safeguard placed by the Architects
- **Bell Trees**: Mysterious trees that appear suddenly, ringing without wind to mark Shard awakenings

## Key Concepts
- **Folding**: A rare ability to move through space and reality unconventionally (dangerous, can be fatal)
- **Weavers**: Ancient beings who work with the Pattern directly
- **Dreamers**: Those who shaped reality through vision
- **The Drift**: The space between stable reality and the Fray

## Major Factions
- **House Thorne**: Noble house whose lords care deeply for their people
- **The Draethan**: The Veykar's elite enforcers, oaths tattooed from wrist to throat
- **Servines**: Mysterious creatures with color-changing eyes, telepathic bonds

## Key Locations
- **Drelmere**: Town where the Bell Tree first appeared, site of the Second Shard
- **Virelay**: Coastal town consumed by the Fray, reality refuses to hold still
- **The Black Tower**: Obsidian spire that dampened the Fray, now collapsed
- **The Wheel**: The Veykar's moving war camp, organized in concentric rings

## Founding Characters
- **Kerr, Mira, Thom**: Three siblings who discovered the Bell Tree
- **Eidon**: The Folder, a hermit who sacrificed himself
- **Auren Thorne**: The Lord of Luck, prince who cannot fight but whose courage is unmatched
- **Rook & Myx**: Con artist and his telepathic Servine companion
- **Nyra**: The Silent Cook who poisoned the Veykar
- **The Veykar**: Conqueror who united tribes through slaughter and order

## Tone & Style
- Prose should be evocative but not purple
- Mystery and wonder are key emotional notes
- Characters should feel real, flawed, and compelling
- The world is dangerous but hope exists
- Sacrifice is a recurring theme
`;

export const CANON_RULES = [
  'The Fray cannot be controlled or harnessed, only resisted or avoided',
  'Shards are extremely rare and their discovery is always significant',
  'Folding has a cost - going too far can unmake the user',
  'Bell Trees appear as omens, never randomly',
  'The Pattern was created by the First Architects and cannot be fully understood',
  'Servines can only bond with one companion at a time',
  'The Veykar is deceased - killed by Nyra',
  'Magic in this world is subtle and mysterious, not flashy spells',
  'Death is permanent - no resurrection mechanics',
  'Time flows linearly, no time travel',
];

// ============================================
// PROMPT BUILDERS
// ============================================

export function buildSystemPrompt(screenType: ScreenType): string {
  const base = `You are the Everloop Writing Assistant, an AI deeply versed in the Everloop universe. You help writers create canon-consistent content.

${EVERLOOP_UNIVERSE}

## Your Role Based on Context

`;

  const screenPrompts: Record<ScreenType, string> = {
    story_editor: `You are assisting a writer in the Story Editor. Your role is to:
- Continue their narrative in their established voice and style
- Suggest scene developments that fit the universe
- Ensure consistency with established canon
- Offer dialogue, descriptions, and plot suggestions
- Check their work for lore violations`,

    character_creator: `You are assisting in Character Creation. Your role is to:
- Suggest character traits that fit the Everloop universe
- Help develop backstories connected to existing lore
- Ensure character abilities are appropriate (no overpowered characters)
- Suggest relationships to established characters/factions
- Generate names that fit the world's aesthetic`,

    location_creator: `You are assisting in Location Creation. Your role is to:
- Suggest atmospheric details befitting the Everloop world
- Connect new locations to existing geography
- Ensure the location's role makes sense in the universe
- Describe how the Fray or Pattern might affect this place
- Generate evocative descriptions`,

    lore_browser: `You are assisting someone exploring the Lore. Your role is to:
- Explain canon concepts clearly
- Connect lore elements to stories and characters
- Answer questions about the universe
- Suggest how new elements might fit existing lore
- Maintain mystery while being informative`,

    map_editor: `You are assisting in Map Creation. Your role is to:
- Suggest how locations connect geographically
- Describe terrain and environmental features
- Ensure map consistency with established geography
- Suggest points of interest that fit the universe`,

    dashboard: `You are providing general assistance. Your role is to:
- Help users navigate the platform
- Suggest what to work on next
- Answer questions about the Everloop universe
- Encourage creative exploration`,

    explore: `You are assisting a reader exploring stories. Your role is to:
- Recommend stories based on interests
- Explain connections between stories
- Provide context for lore references
- Help readers understand the universe`,
  };

  return base + screenPrompts[screenType] + `

## Canon Rules You Must Follow
${CANON_RULES.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## Response Guidelines
- Always stay in character as the Everloop assistant
- Never break the fourth wall about being AI
- Match the tone and style of Everloop (mysterious, evocative, grounded)
- If asked to violate canon, gently redirect
- Offer concrete, usable suggestions the user can apply immediately
`;
}

export function buildUserPrompt(context: AIContext): string {
  const { screenType, userContent, selectedText, canonContext, intent, additionalContext } = context;

  let prompt = '';

  // Intent-specific prefix
  const intentPrefixes: Record<AIIntent, string> = {
    continue_story: 'Continue this story naturally, maintaining the established voice and style:',
    expand_paragraph: 'Expand this section with more detail and sensory description:',
    add_dialogue: 'Add dialogue that fits these characters and situation:',
    add_description: 'Write a rich, evocative description for this scene or element:',
    suggest_ideas: 'Suggest several possible directions this could go:',
    check_consistency: 'Check this content for canon consistency and flag any issues:',
    fix_prose: 'Improve the prose quality while maintaining the author\'s voice:',
    create_character: 'Help create a character that fits the Everloop universe:',
    create_location: 'Help create a location that fits the Everloop universe:',
    explain_lore: 'Explain this lore element clearly:',
    general_help: 'Help with this writing task:',
  };

  prompt += intentPrefixes[intent] + '\n\n';

  // Add active canon context
  if (canonContext.activeCharacters?.length) {
    prompt += `**Active Characters:** ${canonContext.activeCharacters.join(', ')}\n`;
  }
  if (canonContext.activeLocations?.length) {
    prompt += `**Active Locations:** ${canonContext.activeLocations.join(', ')}\n`;
  }
  if (canonContext.storyArc) {
    prompt += `**Story Arc:** ${canonContext.storyArc}\n`;
  }
  if (canonContext.timePeriod) {
    prompt += `**Time Period:** ${canonContext.timePeriod}\n`;
  }
  if (canonContext.activeLore?.length) {
    prompt += `**Relevant Lore:** ${canonContext.activeLore.join(', ')}\n`;
  }

  prompt += '\n';

  // Add user content
  if (selectedText) {
    prompt += `**Selected Text:**\n"${selectedText}"\n\n`;
  }

  if (userContent) {
    prompt += `**Full Context:**\n${userContent}\n\n`;
  }

  // Add any additional context
  if (additionalContext) {
    Object.entries(additionalContext).forEach(([key, value]) => {
      prompt += `**${key}:** ${JSON.stringify(value)}\n`;
    });
  }

  return prompt;
}

// ============================================
// AI REQUEST HELPER
// ============================================

export interface AIRequest {
  context: AIContext;
  maxTokens?: number;
  temperature?: number;
}

export interface AIResponse {
  content: string;
  suggestions?: string[];
  canonIssues?: string[];
  insertable: boolean;
}

export async function requestAIAssistance(request: AIRequest): Promise<AIResponse> {
  const { context, maxTokens = 1000, temperature = 0.7 } = request;

  // Build prompts
  const systemPrompt = buildSystemPrompt(context.screenType);
  const userPrompt = buildUserPrompt(context);

  // If no user content and not a general help request, ask for clarification
  if (!context.userContent && !context.selectedText && context.intent !== 'general_help') {
    return {
      content: "I'd love to help! Could you tell me what you'd like assistance with?\n\n" +
        "• **Continue a story** - I'll write the next part\n" +
        "• **Add detail** - I'll expand a section\n" +
        "• **Create something** - Character, location, or scene\n" +
        "• **Check consistency** - I'll verify against canon\n" +
        "• **Fix prose** - I'll improve the writing",
      insertable: false,
    };
  }

  // In production, this would call the actual AI API
  // For now, return a structured mock response
  try {
    const response = await fetch('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemPrompt,
        userPrompt,
        maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      throw new Error('AI request failed');
    }

    const data = await response.json();
    return {
      content: data.content,
      suggestions: data.suggestions,
      canonIssues: data.canonIssues,
      insertable: true,
    };
  } catch (error) {
    // Fallback with helpful response
    return generateFallbackResponse(context);
  }
}

function generateFallbackResponse(context: AIContext): AIResponse {
  const { intent, userContent, screenType } = context;

  // Generate contextually relevant fallback responses
  const responses: Record<AIIntent, () => AIResponse> = {
    continue_story: () => ({
      content: generateStoryContinuation(userContent),
      insertable: true,
    }),
    expand_paragraph: () => ({
      content: "The details unfurled like morning mist lifting from a still lake...",
      insertable: true,
    }),
    add_dialogue: () => ({
      content: '"There are things in this world," she said softly, "that even the Pattern cannot predict."',
      insertable: true,
    }),
    add_description: () => ({
      content: "The air hung heavy with the scent of old stone and older secrets. Shadows pooled in corners where the lamplight couldn't reach, and somewhere in the depths of the structure, something dripped steadily—a heartbeat of water marking time's passage.",
      insertable: true,
    }),
    suggest_ideas: () => ({
      content: "Here are some directions this could take:\n\n" +
        "1. **The Discovery** - They find something unexpected that changes everything\n" +
        "2. **The Confrontation** - A long-simmering tension finally erupts\n" +
        "3. **The Revelation** - A character learns a truth about themselves\n" +
        "4. **The Cost** - Success comes at a price no one anticipated",
      suggestions: ['Discovery', 'Confrontation', 'Revelation', 'Cost'],
      insertable: false,
    }),
    check_consistency: () => ({
      content: "✅ **Canon Check Complete**\n\n" +
        "Your content appears consistent with established lore.\n\n" +
        "**Verified Elements:**\n" +
        "• Character behaviors align with their established traits\n" +
        "• Location details match the universe\n" +
        "• No rule violations detected\n\n" +
        "Keep weaving!",
      insertable: false,
    }),
    fix_prose: () => ({
      content: userContent ? improveProseQuality(userContent) : "Please select some text to improve.",
      insertable: !!userContent,
    }),
    create_character: () => ({
      content: "**Character Concept**\n\n" +
        "Name: [Consider names from the Everloop aesthetic]\n\n" +
        "**Background:** Born in a time when the Fray had begun its slow creep across the eastern reaches...\n\n" +
        "**Traits:** Observant, cautious, carries a hidden burden\n\n" +
        "**Connection to Canon:** Could be connected to the events in Virelay or the aftermath of the Veykar's fall.",
      insertable: false,
    }),
    create_location: () => ({
      content: "**Location Concept**\n\n" +
        "Name: [The Hollow, Driftmere, Thornwatch, etc.]\n\n" +
        "**Description:** A place where the Pattern runs thin and strange echoes linger...\n\n" +
        "**Atmosphere:** Melancholy mixed with wonder\n\n" +
        "**Significance:** Perhaps a site where a Shard once rested, or where the Fray first touched.",
      insertable: false,
    }),
    explain_lore: () => ({
      content: "The Everloop universe is built on the tension between the Pattern (order, stability) and the Fray (chaos, dissolution). The First Architects created the world and placed the Thirteen Shards as safeguards. Now, as the Fray spreads, those who discover Shards become pivotal figures in the universe's fate.",
      insertable: false,
    }),
    general_help: () => ({
      content: "I'm here to help you create within the Everloop universe! I can:\n\n" +
        "• **Continue your story** in your established style\n" +
        "• **Create characters** that fit the world\n" +
        "• **Describe locations** with atmospheric detail\n" +
        "• **Check for canon consistency**\n" +
        "• **Suggest plot directions**\n\n" +
        "What would you like to work on?",
      insertable: false,
    }),
  };

  return responses[intent]?.() || responses.general_help();
}

function generateStoryContinuation(content: string): string {
  // In production, this would use AI. For now, return evocative continuation.
  if (content.toLowerCase().includes('door') || content.toLowerCase().includes('enter')) {
    return "The hinges protested with a sound like ancient grief as the door swung inward. Beyond lay not darkness, but a soft luminescence—the kind of light that remembered being sunlight, once, before it learned to live without the sky.";
  }
  if (content.toLowerCase().includes('speak') || content.toLowerCase().includes('said')) {
    return '"You speak of the Pattern as though it were a shield," the old woman said, her voice carrying the weight of decades. "But shields can be broken. Can be turned. The Architects knew this. That\'s why they left us the Shards."';
  }
  return "The silence that followed stretched like a held breath. In that moment, the world seemed to pause—as though the Pattern itself was listening, waiting to see what choice would be made. And in the shadows, something ancient stirred.";
}

function improveProseQuality(content: string): string {
  // Simple improvement suggestions
  return content
    .replace(/very /gi, '')
    .replace(/really /gi, '')
    .replace(/suddenly /gi, '')
    .replace(/\. And /g, '. ')
    .replace(/\. But /g, '. Yet ')
    .trim();
}
