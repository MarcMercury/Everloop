/**
 * Canon Contributions API
 * 
 * Public log of all contributions to the Everloop universe.
 * Every creator gets credit, every contribution is tracked.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET: Fetch canon contributions
 * 
 * Query params:
 * - lane: 'instant' | 'branch' | 'primary'
 * - type: content type filter
 * - creator: creator ID filter
 * - featured: 'true' for featured only
 * - limit: number of results
 * - offset: pagination offset
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { searchParams } = new URL(request.url)
  const lane = searchParams.get('lane')
  const type = searchParams.get('type')
  const creatorId = searchParams.get('creator')
  const featured = searchParams.get('featured') === 'true'
  const limit = parseInt(searchParams.get('limit') || '50')
  const offset = parseInt(searchParams.get('offset') || '0')
  
  let query = supabase
    .from('canon_contributions')
    .select(`
      *,
      profiles:creator_id (
        id,
        display_name,
        avatar_url
      )
    `)
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1)
  
  if (lane) {
    query = query.eq('canon_lane', lane)
  }
  
  if (type) {
    query = query.eq('content_type', type)
  }
  
  if (creatorId) {
    query = query.eq('creator_id', creatorId)
  }
  
  if (featured) {
    query = query.eq('is_featured', true)
  }
  
  const { data: contributions, error } = await query
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Get stats
  const { count: totalCount } = await supabase
    .from('canon_contributions')
    .select('*', { count: 'exact', head: true })
  
  const { data: laneStats } = await supabase
    .from('canon_contributions')
    .select('canon_lane')
  
  const stats = {
    total: totalCount || 0,
    instant: laneStats?.filter(c => c.canon_lane === 'instant').length || 0,
    branch: laneStats?.filter(c => c.canon_lane === 'branch').length || 0,
    primary: laneStats?.filter(c => c.canon_lane === 'primary').length || 0,
  }
  
  return NextResponse.json({
    contributions,
    stats,
    pagination: {
      limit,
      offset,
      total: totalCount || 0,
      hasMore: (offset + limit) < (totalCount || 0),
    }
  })
}

/**
 * POST: Record a new contribution (internal use)
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { 
      contentType, 
      contentId, 
      title, 
      summary, 
      contributionType,
      canonLane,
      canonTier,
      tags,
      weaveConnections,
    } = body
    
    const { data: contribution, error } = await supabase
      .from('canon_contributions')
      .insert({
        content_type: contentType,
        content_id: contentId,
        creator_id: user.id,
        title,
        summary,
        contribution_type: contributionType || `new_${contentType}`,
        canon_lane: canonLane || 'instant',
        canon_tier: canonTier || 'ambient',
        tags: tags || [],
        weave_connections: weaveConnections || [],
        published_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({ contribution })
    
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to record contribution' 
    }, { status: 500 })
  }
}
