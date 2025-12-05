import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/write/check - Check story for consistency with canon
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { storyId, content, metadata } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // In production, this would call an AI service (OpenAI, Claude, etc.)
    // For now, we return mock analysis
    const analysis = performMockConsistencyCheck(content, metadata);

    // Log the check
    if (storyId) {
      await supabase.from('ai_commit_logs').insert({
        story_id: storyId,
        user_id: user.id,
        ai_suggestion_snippet: `Consistency check: ${analysis.issues.length} issues found`,
      });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Consistency check error:', error);
    return NextResponse.json({ error: 'Failed to check consistency' }, { status: 500 });
  }
}

interface ConsistencyIssue {
  type: 'error' | 'warning' | 'info';
  category: 'canon' | 'timeline' | 'character' | 'worldbuilding' | 'style';
  message: string;
  suggestion?: string;
  position?: { start: number; end: number };
}

interface ConsistencyResult {
  score: number; // 0-100
  issues: ConsistencyIssue[];
  summary: string;
  suggestions: string[];
}

function performMockConsistencyCheck(
  content: string,
  metadata?: { arcs?: string[]; locations?: string[]; characters?: string[]; timePeriod?: string }
): ConsistencyResult {
  const issues: ConsistencyIssue[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check for common issues (mock analysis)
  const wordCount = content.trim().split(/\s+/).length;
  
  // Check story length
  if (wordCount < 100) {
    issues.push({
      type: 'info',
      category: 'style',
      message: 'Story is quite short',
      suggestion: 'Consider expanding your narrative with more detail and scene-setting',
    });
    suggestions.push('Add more descriptive passages to immerse readers in the world');
    score -= 5;
  }

  // Check for dialogue
  const hasDialogue = content.includes('"') || content.includes("'");
  if (!hasDialogue && wordCount > 200) {
    issues.push({
      type: 'info',
      category: 'style',
      message: 'No dialogue detected',
      suggestion: 'Dialogue can help bring characters to life and break up prose',
    });
    suggestions.push('Consider adding character interactions through dialogue');
    score -= 3;
  }

  // Check for Everloop terminology (mock canon check)
  const hasCanonTerms = /weave|fray|shard|drift|fold|loom|thread/i.test(content);
  if (!hasCanonTerms && wordCount > 150) {
    issues.push({
      type: 'warning',
      category: 'worldbuilding',
      message: 'Limited Everloop terminology detected',
      suggestion: 'Incorporate universe-specific terms to ground your story in the canon',
    });
    suggestions.push('Reference elements like the Weave, Shards, or the Fray to connect to the broader universe');
    score -= 10;
  }

  // Mock character consistency check
  if (metadata?.characters && metadata.characters.length > 0) {
    issues.push({
      type: 'info',
      category: 'character',
      message: `Story references ${metadata.characters.length} canon character(s)`,
      suggestion: 'Ensure character behaviors align with their established traits',
    });
  }

  // Mock timeline check
  if (metadata?.timePeriod) {
    issues.push({
      type: 'info',
      category: 'timeline',
      message: `Story is set in the ${metadata.timePeriod} period`,
      suggestion: 'Verify technology and cultural references match the era',
    });
  }

  // Generate summary
  let summary: string;
  if (score >= 90) {
    summary = 'Excellent! Your story aligns well with Everloop canon.';
  } else if (score >= 70) {
    summary = 'Good work! A few minor adjustments could strengthen the connection to canon.';
  } else if (score >= 50) {
    summary = 'Your story has potential. Consider the suggestions below to better integrate with the universe.';
  } else {
    summary = 'Please review the issues below to ensure your story fits within the Everloop universe.';
  }

  return {
    score: Math.max(0, score),
    issues,
    summary,
    suggestions,
  };
}
