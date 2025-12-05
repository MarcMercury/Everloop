import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET a specific quest with nodes and choices
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: quest, error: questError } = await supabase
    .from('quests')
    .select(`
      *,
      profiles:creator_id (display_name)
    `)
    .eq('id', id)
    .single()

  if (questError) {
    return NextResponse.json({ error: questError.message }, { status: 404 })
  }

  // Check access
  if (quest.creator_id !== user.id && quest.visibility === 'private') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fetch nodes
  const { data: nodes } = await supabase
    .from('quest_nodes')
    .select('*')
    .eq('quest_id', id)

  // Fetch choices
  const nodeIds = (nodes || []).map(n => n.id)
  const { data: choices } = await supabase
    .from('quest_choices')
    .select('*')
    .in('from_node_id', nodeIds)

  // Fetch NPCs
  const { data: npcs } = await supabase
    .from('quest_npcs')
    .select('*')
    .eq('quest_id', id)

  return NextResponse.json({
    ...quest,
    quest_nodes: nodes || [],
    quest_choices: choices || [],
    quest_npcs: npcs || [],
  })
}

// PATCH update a quest
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('quests')
    .select('creator_id')
    .eq('id', id)
    .single()

  if (!existing || existing.creator_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, quest_type, difficulty, visibility, status, nodes, edges } = body

  // Update quest
  const { data: quest, error: questError } = await supabase
    .from('quests')
    .update({
      title,
      description,
      quest_type,
      difficulty,
      visibility,
      status,
    })
    .eq('id', id)
    .select()
    .single()

  if (questError) {
    return NextResponse.json({ error: questError.message }, { status: 500 })
  }

  // Update nodes if provided
  if (nodes) {
    // Delete existing nodes (cascades to choices)
    await supabase.from('quest_nodes').delete().eq('quest_id', id)

    // Insert new nodes
    if (nodes.length > 0) {
      const { data: insertedNodes } = await supabase
        .from('quest_nodes')
        .insert(
          nodes.map((node: any) => ({
            id: node.id, // Preserve IDs for edge mapping
            quest_id: id,
            node_type: node.data.nodeType,
            title: node.data.label,
            content: node.data.content,
            x_position: node.position.x,
            y_position: node.position.y,
            properties: node.data.properties || {},
          }))
        )
        .select()

      // Update start_node_id if there's a start node
      const startNode = nodes.find((n: any) => n.data.nodeType === 'start')
      if (startNode) {
        await supabase
          .from('quests')
          .update({ start_node_id: startNode.id })
          .eq('id', id)
      }

      // Insert edges as choices
      if (edges && edges.length > 0) {
        await supabase.from('quest_choices').insert(
          edges.map((edge: any) => ({
            from_node_id: edge.source,
            to_node_id: edge.target,
            choice_text: edge.label || 'Continue',
            requirements: {},
            consequences: {},
          }))
        )
      }
    }
  }

  return NextResponse.json(quest)
}

// DELETE a quest
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('quests')
    .select('creator_id')
    .eq('id', id)
    .single()

  if (!existing || existing.creator_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { error } = await supabase
    .from('quests')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
