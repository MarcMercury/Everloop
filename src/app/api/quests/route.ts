import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET all quests for the current user
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('quests')
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

// POST create a new quest
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { title, description, quest_type, difficulty, visibility } = body

  const { data, error } = await supabase
    .from('quests')
    .insert({
      creator_id: user.id,
      title: title || 'Untitled Quest',
      description,
      quest_type: quest_type || 'lore',
      difficulty: difficulty || 'normal',
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
