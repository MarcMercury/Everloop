import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET all lore entries
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('lore_entries')
    .select(`
      *,
      profiles:creator_id (display_name)
    `)
    .or(`creator_id.eq.${user.id},visibility.neq.private`)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST create a new lore entry
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, entry_type, summary, content, tags, visibility } = body

  const { data, error } = await supabase
    .from('lore_entries')
    .insert({
      creator_id: user.id,
      name: name || 'Untitled Entry',
      entry_type: entry_type || 'other',
      summary,
      content,
      tags: tags || [],
      visibility: visibility || 'private',
      status: 'draft',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
