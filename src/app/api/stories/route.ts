import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);
  
  const status = searchParams.get('status');
  const type = searchParams.get('type');
  const authorId = searchParams.get('author_id');
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');

  let query = supabase
    .from('stories')
    .select(`
      *,
      profiles:author_id (display_name),
      story_metadata (*)
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (status) {
    query = query.eq('status', status);
  }
  if (type) {
    query = query.eq('type', type);
  }
  if (authorId) {
    query = query.eq('author_id', authorId);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ stories: data });
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, synopsis, type, content, metadata } = body;

  if (!title || !type) {
    return NextResponse.json({ error: 'Title and type are required' }, { status: 400 });
  }

  // Create story
  const { data: story, error: storyError } = await supabase
    .from('stories')
    .insert({
      title,
      synopsis,
      type,
      content: content || '',
      author_id: user.id,
      status: 'draft',
    })
    .select()
    .single();

  if (storyError) {
    return NextResponse.json({ error: storyError.message }, { status: 500 });
  }

  // Create metadata if provided
  if (metadata) {
    const { error: metadataError } = await supabase
      .from('story_metadata')
      .insert({
        story_id: story.id,
        arc_ids: metadata.arc_ids || [],
        location_ids: metadata.location_ids || [],
        character_ids: metadata.character_ids || [],
        time_period_id: metadata.time_period_id || null,
      });

    if (metadataError) {
      console.error('Metadata error:', metadataError);
    }
  }

  return NextResponse.json({ story }, { status: 201 });
}
