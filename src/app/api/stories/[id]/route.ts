import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: story, error } = await supabase
    .from('stories')
    .select(`
      *,
      profiles:author_id (display_name),
      story_metadata (*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 });
  }

  return NextResponse.json({ story });
}

export async function PATCH(
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

  // Check ownership
  const { data: existingStory } = await supabase
    .from('stories')
    .select('author_id')
    .eq('id', id)
    .single();

  if (!existingStory || existingStory.author_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const { title, synopsis, content, status, metadata } = body;

  // Update story
  const updateData: Record<string, any> = {};
  if (title !== undefined) updateData.title = title;
  if (synopsis !== undefined) updateData.synopsis = synopsis;
  if (content !== undefined) updateData.content = content;
  if (status !== undefined) updateData.status = status;

  const { data: story, error: updateError } = await supabase
    .from('stories')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Update metadata if provided
  if (metadata) {
    await supabase
      .from('story_metadata')
      .upsert({
        story_id: id,
        arc_ids: metadata.arc_ids,
        location_ids: metadata.location_ids,
        character_ids: metadata.character_ids,
        time_period_id: metadata.time_period_id,
      });
  }

  return NextResponse.json({ story });
}

export async function DELETE(
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

  // Check ownership
  const { data: existingStory } = await supabase
    .from('stories')
    .select('author_id')
    .eq('id', id)
    .single();

  if (!existingStory || existingStory.author_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { error } = await supabase
    .from('stories')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
