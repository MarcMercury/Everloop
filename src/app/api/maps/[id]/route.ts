import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET a specific map with elements and paths
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: map, error: mapError } = await supabase
    .from('maps')
    .select(`
      *,
      profiles:creator_id (display_name)
    `)
    .eq('id', id)
    .single()

  if (mapError) {
    return NextResponse.json({ error: mapError.message }, { status: 404 })
  }

  // Check access
  if (map.creator_id !== user.id && map.visibility === 'private') {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Fetch elements
  const { data: elements } = await supabase
    .from('map_elements')
    .select('*')
    .eq('map_id', id)

  // Fetch paths
  const { data: paths } = await supabase
    .from('story_paths')
    .select('*')
    .eq('map_id', id)

  return NextResponse.json({
    ...map,
    map_elements: elements || [],
    story_paths: paths || [],
  })
}

// PATCH update a map
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('maps')
    .select('creator_id')
    .eq('id', id)
    .single()

  if (!existing || existing.creator_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const body = await request.json()
  const { name, description, visibility, status, canvas_data, elements, paths } = body

  // Update map
  const { data: map, error: mapError } = await supabase
    .from('maps')
    .update({
      name,
      description,
      visibility,
      status,
      canvas_data,
    })
    .eq('id', id)
    .select()
    .single()

  if (mapError) {
    return NextResponse.json({ error: mapError.message }, { status: 500 })
  }

  // Update elements if provided
  if (elements) {
    // Delete existing elements
    await supabase.from('map_elements').delete().eq('map_id', id)

    // Insert new elements
    if (elements.length > 0) {
      await supabase.from('map_elements').insert(
        elements.map((el: any) => ({
          map_id: id,
          element_type: el.type,
          name: el.name,
          description: el.description,
          x_position: el.x,
          y_position: el.y,
          scale: el.scale || 1,
          rotation: el.rotation || 0,
          properties: el.properties || {},
        }))
      )
    }
  }

  // Update paths if provided
  if (paths) {
    // Delete existing paths
    await supabase.from('story_paths').delete().eq('map_id', id)

    // We need element IDs, so fetch them first
    const { data: newElements } = await supabase
      .from('map_elements')
      .select('id, name')
      .eq('map_id', id)

    // Insert new paths (simplified - would need proper element ID mapping)
    // This is a placeholder for the actual implementation
  }

  return NextResponse.json(map)
}

// DELETE a map
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify ownership
  const { data: existing } = await supabase
    .from('maps')
    .select('creator_id')
    .eq('id', id)
    .single()

  if (!existing || existing.creator_id !== user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { error } = await supabase
    .from('maps')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
