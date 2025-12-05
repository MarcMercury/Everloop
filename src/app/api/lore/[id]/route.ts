import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET a specific lore entry with references
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: entry, error: entryError } = await supabase
    .from('lore_entries')
    .select(`
      *,
      profiles:creator_id (display_name)
    `)
    .eq('id', id)
    .single()

  if (entryError) {
    return NextResponse.json({ error: entryError.message }, { status: 404 })
  }

  // Check access
  if (entry.creator_id !== user.id && entry.visibility === 'private') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fetch references
  const { data: references } = await supabase
    .from('lore_references')
    .select('*')
    .eq('lore_entry_id', id)

  // Fetch timeline
  const { data: timeline } = await supabase
    .from('lore_timeline')
    .select(`
      *,
      time_periods (name, chronological_order)
    `)
    .eq('lore_entry_id', id)

  return NextResponse.json({
    ...entry,
    lore_references: references || [],
    lore_timeline: timeline || [],
  })
}

// PATCH update a lore entry
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('lore_entries')
    .select('creator_id')
    .eq('id', id)
    .single()

  if (!existing || existing.creator_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { name, entry_type, summary, content, tags, visibility, status, properties, images } = body

  const { data, error } = await supabase
    .from('lore_entries')
    .update({
      name,
      entry_type,
      summary,
      content,
      tags,
      visibility,
      status,
      properties,
      images,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE a lore entry
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('lore_entries')
    .select('creator_id')
    .eq('id', id)
    .single()

  if (!existing || existing.creator_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { error } = await supabase
    .from('lore_entries')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
