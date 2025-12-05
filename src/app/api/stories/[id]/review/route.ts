import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST: Submit story for canon review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check ownership and get story
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .select('*, story_metadata (*)')
    .eq('id', id)
    .single();

  if (storyError || !story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 });
  }

  if (story.author_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  if (!story.content || story.content.length < 100) {
    return NextResponse.json({ error: 'Story must have at least 100 characters of content' }, { status: 400 });
  }

  // Get all canon rules for the review
  const { data: rules } = await supabase
    .from('rules')
    .select('*');

  // Get relevant canon data
  const metadata = story.story_metadata?.[0] || story.story_metadata;
  let canonContext: Record<string, any> = { rules };

  if (metadata) {
    const [arcsRes, locationsRes, charactersRes, periodRes] = await Promise.all([
      metadata.arc_ids?.length
        ? supabase.from('arcs').select('*').in('id', metadata.arc_ids)
        : Promise.resolve({ data: [] }),
      metadata.location_ids?.length
        ? supabase.from('locations').select('*').in('id', metadata.location_ids)
        : Promise.resolve({ data: [] }),
      metadata.character_ids?.length
        ? supabase.from('characters').select('*').in('id', metadata.character_ids)
        : Promise.resolve({ data: [] }),
      metadata.time_period_id
        ? supabase.from('time_periods').select('*').eq('id', metadata.time_period_id).single()
        : Promise.resolve({ data: null }),
    ]);

    canonContext = {
      ...canonContext,
      arcs: arcsRes.data || [],
      locations: locationsRes.data || [],
      characters: charactersRes.data || [],
      timePeriod: periodRes.data,
    };
  }

  // In production, this would call an AI service
  // For now, we create a placeholder review
  const reviewResult = {
    overall_status: 'pending_human_review' as const,
    issues: [],
    suggestions: [
      'Consider adding more sensory details to bring the setting to life.',
      'The dialogue flows naturally but could benefit from more subtext.',
    ],
    canon_compliance_score: 0.85,
    reviewed_at: new Date().toISOString(),
  };

  // Create the canon review record
  const { data: review, error: reviewError } = await supabase
    .from('canon_reviews')
    .insert({
      story_id: id,
      reviewer_type: 'ai',
      status: reviewResult.overall_status,
      issues: reviewResult.issues,
      suggestions: reviewResult.suggestions,
      canon_compliance_score: reviewResult.canon_compliance_score,
    })
    .select()
    .single();

  if (reviewError) {
    return NextResponse.json({ error: reviewError.message }, { status: 500 });
  }

  // Update story status
  await supabase
    .from('stories')
    .update({ status: 'pending_review' })
    .eq('id', id);

  return NextResponse.json({
    review,
    message: 'Story submitted for canon review',
  });
}

// GET: Get review status for a story
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: reviews, error } = await supabase
    .from('canon_reviews')
    .select('*')
    .eq('story_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ reviews });
}
