/**
 * Creator Stats API
 * 
 * Track creator contributions and achievements.
 * Makes creators feel their work matters.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET: Fetch creator stats
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { searchParams } = new URL(request.url)
  const creatorId = searchParams.get('creatorId')
  
  // If no creatorId, get current user
  let targetId = creatorId
  if (!targetId) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    targetId = user.id
  }
  
  // Get creator stats
  const { data: stats, error } = await supabase
    .from('creator_stats')
    .select('*')
    .eq('creator_id', targetId)
    .single()
  
  // If no stats exist, create default
  if (error && error.code === 'PGRST116') {
    const { data: newStats } = await supabase
      .from('creator_stats')
      .insert({ creator_id: targetId })
      .select()
      .single()
    
    return NextResponse.json({ 
      stats: newStats || getDefaultStats(targetId) 
    })
  }
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  // Get recent contributions
  const { data: recentContributions } = await supabase
    .from('canon_contributions')
    .select('*')
    .eq('creator_id', targetId)
    .order('published_at', { ascending: false })
    .limit(10)
  
  // Get creator profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url, role')
    .eq('id', targetId)
    .single()
  
  return NextResponse.json({
    stats,
    profile,
    recentContributions: recentContributions || [],
    achievements: calculateAchievements(stats),
    rank: calculateRank(stats),
  })
}

/**
 * Calculate achievements based on stats
 */
function calculateAchievements(stats: any): Achievement[] {
  if (!stats) return []
  
  const achievements: Achievement[] = []
  
  // First contribution
  if (stats.total_contributions >= 1) {
    achievements.push({
      id: 'first_thread',
      name: 'First Thread',
      description: 'Made your first contribution to the Weave',
      icon: '🧵',
      unlockedAt: stats.last_contribution_at,
    })
  }
  
  // 10 contributions
  if (stats.total_contributions >= 10) {
    achievements.push({
      id: 'weave_walker',
      name: 'Weave Walker',
      description: 'Made 10 contributions to the universe',
      icon: '🚶',
    })
  }
  
  // 50 contributions
  if (stats.total_contributions >= 50) {
    achievements.push({
      id: 'pattern_reader',
      name: 'Pattern Reader',
      description: 'Made 50 contributions to the universe',
      icon: '👁️',
    })
  }
  
  // 100 contributions
  if (stats.total_contributions >= 100) {
    achievements.push({
      id: 'loom_master',
      name: 'Loom Master',
      description: 'Made 100 contributions to the universe',
      icon: '✨',
    })
  }
  
  // Diverse creator (multiple content types)
  const contentTypes = [
    stats.stories_count,
    stats.characters_count,
    stats.locations_count,
    stats.quests_count,
    stats.maps_count,
    stats.creatures_count,
    stats.lore_entries_count,
  ].filter(c => c > 0).length
  
  if (contentTypes >= 3) {
    achievements.push({
      id: 'versatile_weaver',
      name: 'Versatile Weaver',
      description: 'Created content in 3+ different categories',
      icon: '🎨',
    })
  }
  
  if (contentTypes >= 5) {
    achievements.push({
      id: 'master_artisan',
      name: 'Master Artisan',
      description: 'Created content in 5+ different categories',
      icon: '🏆',
    })
  }
  
  // Streak achievements
  if (stats.current_streak >= 7) {
    achievements.push({
      id: 'devoted',
      name: 'Devoted',
      description: 'Contributed for 7 days in a row',
      icon: '🔥',
    })
  }
  
  if (stats.longest_streak >= 30) {
    achievements.push({
      id: 'unstoppable',
      name: 'Unstoppable',
      description: 'Contributed for 30 days in a row',
      icon: '⚡',
    })
  }
  
  // Primary canon
  if (stats.primary_canon_count >= 1) {
    achievements.push({
      id: 'canon_shaper',
      name: 'Canon Shaper',
      description: 'Had a contribution accepted to Primary Canon',
      icon: '⭐',
    })
  }
  
  // Influential (others reference your work)
  if (stats.total_references >= 10) {
    achievements.push({
      id: 'influential',
      name: 'Influential',
      description: 'Your work has been referenced 10+ times by others',
      icon: '🌟',
    })
  }
  
  return achievements
}

/**
 * Calculate creator rank based on contributions
 */
function calculateRank(stats: any): CreatorRank {
  if (!stats) {
    return { level: 1, title: 'Thread Spinner', nextLevel: 10, progress: 0 }
  }
  
  const contributions = stats.total_contributions || 0
  
  const ranks: { min: number; level: number; title: string }[] = [
    { min: 0, level: 1, title: 'Thread Spinner' },
    { min: 10, level: 2, title: 'Pattern Seeker' },
    { min: 25, level: 3, title: 'Weave Walker' },
    { min: 50, level: 4, title: 'Story Keeper' },
    { min: 100, level: 5, title: 'Lore Weaver' },
    { min: 200, level: 6, title: 'World Builder' },
    { min: 500, level: 7, title: 'Canon Shaper' },
    { min: 1000, level: 8, title: 'Pattern Master' },
    { min: 2500, level: 9, title: 'Fold Walker' },
    { min: 5000, level: 10, title: 'Weave Architect' },
    { min: 10000, level: 11, title: 'Legend' },
  ]
  
  let currentRank = ranks[0]
  let nextRank = ranks[1]
  
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (contributions >= ranks[i].min) {
      currentRank = ranks[i]
      nextRank = ranks[i + 1] || ranks[i]
      break
    }
  }
  
  const progress = nextRank.min > currentRank.min
    ? ((contributions - currentRank.min) / (nextRank.min - currentRank.min)) * 100
    : 100
  
  return {
    level: currentRank.level,
    title: currentRank.title,
    nextLevel: nextRank.min,
    progress: Math.min(100, Math.round(progress)),
  }
}

/**
 * Get default stats for new creator
 */
function getDefaultStats(creatorId: string) {
  return {
    creator_id: creatorId,
    total_contributions: 0,
    instant_canon_count: 0,
    branch_canon_count: 0,
    primary_canon_count: 0,
    stories_count: 0,
    characters_count: 0,
    locations_count: 0,
    quests_count: 0,
    maps_count: 0,
    creatures_count: 0,
    lore_entries_count: 0,
    total_views: 0,
    total_references: 0,
    achievements: [],
    current_streak: 0,
    longest_streak: 0,
  }
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
}

interface CreatorRank {
  level: number
  title: string
  nextLevel: number
  progress: number
}
