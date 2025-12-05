import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/write/suggest - Get AI writing suggestions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId, content, type, context } = await request.json();

    if (!type) {
      return NextResponse.json({ error: 'Suggestion type is required' }, { status: 400 });
    }

    // In production, this would call an AI service
    const suggestion = generateMockSuggestion(type, content, context);

    // Log the suggestion
    if (storyId) {
      await supabase.from('ai_commit_logs').insert({
        story_id: storyId,
        user_id: user.id,
        ai_suggestion_snippet: `Generated ${type} suggestion`,
      });
    }

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error('Suggestion error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 });
  }
}

type SuggestionType = 'continue' | 'dialogue' | 'describe' | 'whatif' | 'improve';

interface Suggestion {
  id: string;
  type: SuggestionType;
  content: string;
  rationale?: string;
  alternatives?: string[];
}

function generateMockSuggestion(
  type: SuggestionType,
  content?: string,
  context?: { arcs?: string[]; locations?: string[]; characters?: string[] }
): Suggestion {
  const id = Date.now().toString();

  switch (type) {
    case 'continue':
      return {
        id,
        type,
        content: `The threads of fate trembled as she reached deeper into the weave. What she found there—memories not her own, echoes of Weavers long past—sent shivers down her spine. The stones of Verath had witnessed countless bindings, but none quite like this.

A sound echoed through the chamber, neither human nor wholly familiar. She turned, her fingers still tangled in the luminescent strands, and felt the weight of ages pressing down upon her shoulders.`,
        rationale: 'This continuation builds tension while exploring the mystical elements of the Weave, incorporating sensory details and emotional stakes.',
        alternatives: [
          'The Weave pulsed once, twice—and then went still. In that silence, she heard the truth she\'d been avoiding.',
          'Behind her, footsteps approached. Not the shuffling of the Folded, but something older. Something that remembered.',
        ],
      };

    case 'dialogue':
      return {
        id,
        type,
        content: `"You don't understand what you're asking," the elder Weaver said, his voice trembling like a plucked thread. "The Fray doesn't just consume—it remembers. Every pattern we've broken, every thread we've severed... it's all still there, waiting."

She met his gaze without flinching. "Then let it remember what I'm about to do."

"Child," he whispered, "that's precisely what I'm afraid of."`,
        rationale: 'This dialogue establishes tension between characters while revealing information about the Fray in a natural way.',
        alternatives: [
          '"The Loom doesn\'t lie. Whatever you saw in the threads—that\'s already been woven into fate."',
          '"I\'ve walked the Drift for seven cycles. Trust me when I say: some doors aren\'t meant to be opened."',
        ],
      };

    case 'describe':
      return {
        id,
        type,
        content: `The chamber stretched impossibly upward, its walls carved with spiraling patterns that seemed to shift when viewed from the corner of the eye. Luminescent fungi clung to the ancient stones, casting everything in a soft, ethereal blue—the color of old starlight, of forgotten dreams.

The air tasted of copper and forgotten oaths. Every breath carried whispers of those who had stood here before: Weavers, Keepers, and beings whose names had long since unraveled from the tapestry of memory. The floor beneath her feet hummed with residual power, a heartbeat that had outlasted empires.`,
        rationale: 'This description engages multiple senses while incorporating Everloop-specific imagery and a sense of ancient history.',
        alternatives: [
          'The settlement sprawled before them like a wound in the landscape—buildings twisted by the Fray, their angles wrong in ways that hurt to look at.',
          'Morning came to the Drift in shades of violet and gold, the twin suns painting the clouds in colors that had no names in the common tongue.',
        ],
      };

    case 'whatif':
      return {
        id,
        type,
        content: `What if the protagonist discovers that their mentor was actually a Folded One all along?

**Story Implications:**
• Every past interaction takes on new meaning—were they being manipulated or protected?
• The protagonist's abilities might have a darker origin than believed
• This revelation could tie into the broader mystery of the Unraveling

**Canon Connections:**
This twist aligns with the established lore that Folded Ones can maintain their identity longer than commonly believed, especially if they were powerful Weavers before their transformation.

**Narrative Opportunities:**
1. Flashback sequences that recontextualize earlier events
2. Moral ambiguity—was the mentor's guidance genuine despite their nature?
3. Connection to the larger conflict between order and entropy`,
        rationale: 'This scenario creates dramatic irony and emotional complexity while staying consistent with Everloop canon.',
        alternatives: [
          'What if the Fray isn\'t destroying reality, but trying to communicate something?',
          'What if the protagonist\'s greatest strength is actually a side effect of a curse?',
          'What if the "enemy" faction has been right all along, just using wrong methods?',
        ],
      };

    case 'improve':
      return {
        id,
        type,
        content: `**Suggested Improvements:**

1. **Pacing**: Consider breaking up the action sequence with a brief moment of reflection or sensory detail.

2. **Character Voice**: The protagonist's dialogue could be more distinctive—try giving them a verbal quirk or speech pattern.

3. **Worldbuilding Integration**: Mention how the Weave or local customs affect this scene to deepen immersion.

4. **Emotional Stakes**: What does the protagonist stand to lose? Making this explicit will raise tension.

5. **Sensory Details**: Add smell, touch, or taste descriptions to ground readers in the moment.`,
        rationale: 'These suggestions are based on common areas where stories can be strengthened while maintaining your unique voice.',
      };

    default:
      return {
        id,
        type: 'continue',
        content: 'The story awaits its next chapter...',
      };
  }
}
