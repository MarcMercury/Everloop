import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/write/whatif - Generate "What If" scenarios
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId, content, context, customPrompt } = await request.json();

    // Generate scenario
    const scenario = generateWhatIfScenario(content, context, customPrompt);

    // Save to database if there's a story
    if (storyId) {
      await supabase.from('what_if_scenarios').insert({
        creator_id: user.id,
        prompt: customPrompt || 'Generated scenario',
        generated_content: scenario.content,
        context_type: 'story',
        context_id: storyId,
      });
    }

    return NextResponse.json(scenario);
  } catch (error) {
    console.error('What If generation error:', error);
    return NextResponse.json({ error: 'Failed to generate scenario' }, { status: 500 });
  }
}

interface WhatIfScenario {
  id: string;
  title: string;
  content: string;
  implications: string[];
  canonCompatibility: 'high' | 'medium' | 'low';
  explorationPrompts: string[];
}

function generateWhatIfScenario(
  content?: string,
  context?: { arcs?: string[]; locations?: string[]; characters?: string[] },
  customPrompt?: string
): WhatIfScenario {
  // In production, this would use AI to analyze the story and generate relevant scenarios
  const scenarios: WhatIfScenario[] = [
    {
      id: '1',
      title: 'The Mentor\'s Secret',
      content: `What if the protagonist discovers that their mentor was actually a Folded One all along?

This revelation could transform the entire narrative. Every piece of advice, every moment of guidance, every sacrifice—all would be reframed through this new lens. Was the mentor protecting the protagonist, or preparing them for something darker?

The Folded Ones are known for losing themselves to the Fray, but what if this one found a way to maintain their identity? Perhaps through the very bond they formed with the protagonist. This creates a beautiful irony: the student unknowingly becomes the anchor that keeps the mentor tethered to reality.`,
      implications: [
        'All previous interactions take on new meaning',
        'The protagonist\'s powers might have unexpected origins',
        'Trust and betrayal themes gain new complexity',
        'Connection to the Unraveling Arc becomes personal',
      ],
      canonCompatibility: 'high',
      explorationPrompts: [
        'How would the protagonist react in the moment of revelation?',
        'What signs did the mentor show that could be reinterpreted?',
        'Does the mentor\'s Folded nature make their guidance invalid?',
      ],
    },
    {
      id: '2',
      title: 'The Fray Speaks',
      content: `What if the Fray isn't a force of destruction, but a desperate attempt at communication?

Throughout Everloop history, the Fray has been seen as the enemy—entropy incarnate, the unmaker of patterns. But what if it's trying to warn us? What if the chaos isn't aggression, but the only language it has left?

Consider: when patterns break down, what remains? Perhaps echoes of something that existed before the Weave itself. The Fray might contain memories of a reality we've forgotten, trying to share knowledge that the Weavers themselves suppressed long ago.`,
      implications: [
        'The entire cosmology of Everloop shifts',
        'The Keepers of the Loom might be hiding something',
        'Characters fighting the Fray might be making things worse',
        'Opens possibilities for communication with the Fray',
      ],
      canonCompatibility: 'medium',
      explorationPrompts: [
        'Who would be the first to understand the Fray\'s message?',
        'What would the established powers do to suppress this truth?',
        'How would this change the protagonist\'s mission?',
      ],
    },
    {
      id: '3',
      title: 'The Shard\'s True Purpose',
      content: `What if Shards aren't fragments of power, but fragments of consciousness?

Every Shard in Everloop is treated as a tool—a source of power to be wielded. But what if each Shard contains a piece of someone? A Weaver who sacrificed themselves, crystallizing their very essence into usable form.

This means every time someone uses a Shard, they're drawing on the lingering will of another being. Some Shards might even be aware, trapped in crystalline prison, feeling every use of their power as a echo of their former life.`,
      implications: [
        'Using Shards becomes an ethical question',
        'Powerful Weavers might discover they can communicate with Shards',
        'The process of creating Shards becomes dark and sacrificial',
        'Characters might seek to free Shards rather than use them',
      ],
      canonCompatibility: 'high',
      explorationPrompts: [
        'Does the protagonist\'s favorite Shard have a personality?',
        'Who would be horrified to learn this truth? Who would embrace it?',
        'Could a Shard be restored to human form?',
      ],
    },
  ];

  // If there's a custom prompt, create a scenario based on it
  if (customPrompt) {
    return {
      id: Date.now().toString(),
      title: 'Custom Scenario',
      content: `Exploring: "${customPrompt}"

This scenario invites you to consider an alternate path for your narrative. By asking this question, you open up new possibilities while staying grounded in the Everloop universe.

Think about:
• How would your characters react differently?
• What new conflicts would arise?
• How does this connect to the broader canon?

The beauty of "what if" is that it doesn't commit you to anything—it simply lets you explore the full possibility space of your story.`,
      implications: [
        'Character motivations may shift',
        'New plot threads become available',
        'Existing conflicts take on new dimensions',
      ],
      canonCompatibility: 'medium',
      explorationPrompts: [
        'What makes this scenario compelling to you?',
        'How does this change the emotional stakes?',
        'Could this lead to a more satisfying resolution?',
      ],
    };
  }

  // Return a random scenario
  return scenarios[Math.floor(Math.random() * scenarios.length)];
}
