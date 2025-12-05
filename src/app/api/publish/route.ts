/**
 * Publishing Pipeline
 * 
 * Handles the flow from creation to publication.
 * Default: INSTANT PUBLISH. No waiting.
 * 
 * Flow:
 * 1. Creator submits content
 * 2. AI validates (< 1 second)
 * 3. Content goes live immediately (unless flagged)
 * 4. Creator sees success + canon lane assignment
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { autoCanonEngine, ContentForValidation, CanonLane } from '@/lib/canon/auto-canon-engine'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const body = await request.json()
    const { contentType, contentId, title, content, metadata, linkedEntities } = body
    
    if (!contentType || !contentId || !title || !content) {
      return NextResponse.json({ 
        error: 'Missing required fields: contentType, contentId, title, content' 
      }, { status: 400 })
    }
    
    // Prepare content for validation
    const contentForValidation: ContentForValidation = {
      type: contentType,
      id: contentId,
      creatorId: user.id,
      title,
      content,
      metadata,
      linkedEntities,
    }
    
    // Add to publishing queue with 'validating' status
    const { data: queueEntry, error: queueError } = await supabase
      .from('publishing_queue')
      .insert({
        content_type: contentType,
        content_id: contentId,
        creator_id: user.id,
        status: 'validating',
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (queueError) {
      console.error('Queue insert error:', queueError)
      // Continue anyway - queue is optional logging
    }
    
    // Run validation (this is fast - < 1 second)
    const validation = await autoCanonEngine.validate(contentForValidation)
    
    // Store validation results
    const { data: validationRecord, error: validationError } = await supabase
      .from('content_validations')
      .insert({
        content_type: contentType,
        content_id: contentId,
        creator_id: user.id,
        canon_lane: validation.canonLane,
        classification: validation.classification,
        confidence_score: validation.confidence,
        world_law_check: validation.checks.worldLaw,
        metaphysics_check: validation.checks.metaphysics,
        timeline_check: validation.checks.timeline,
        geography_check: validation.checks.geography,
        character_check: validation.checks.character,
        tone_check: validation.checks.tone,
        moderation_check: validation.checks.moderation,
        conflicts_detected: validation.conflicts,
        auto_reconciliations: validation.autoReconciliations,
        suggestions: validation.suggestions,
        is_published: validation.canPublish,
        published_at: validation.canPublish ? new Date().toISOString() : null,
        requires_review: !validation.canPublish && validation.classification === 'flagged',
      })
      .select()
      .single()
    
    // Update queue status
    if (queueEntry) {
      await supabase
        .from('publishing_queue')
        .update({
          status: validation.canPublish ? 'published' : 
                 validation.classification === 'flagged' ? 'review_needed' : 'rejected',
          canon_lane: validation.canonLane,
          validated_at: new Date().toISOString(),
          published_at: validation.canPublish ? new Date().toISOString() : null,
          validation_id: validationRecord?.id,
        })
        .eq('id', queueEntry.id)
    }
    
    // If can publish, do it immediately
    if (validation.canPublish) {
      const publishResult = await autoCanonEngine.publish(contentForValidation, validation)
      
      if (!publishResult.success) {
        return NextResponse.json({
          success: false,
          error: publishResult.error,
          validation,
        }, { status: 500 })
      }
      
      return NextResponse.json({
        success: true,
        published: true,
        canonLane: validation.canonLane,
        canonTier: getCanonTier(validation.canonLane),
        message: getSuccessMessage(validation.canonLane),
        contributionId: publishResult.contributionId,
        validation: {
          confidence: validation.confidence,
          suggestions: validation.suggestions,
          autoReconciliations: validation.autoReconciliations,
        }
      })
    }
    
    // If flagged, queue for review
    if (validation.classification === 'flagged') {
      return NextResponse.json({
        success: false,
        published: false,
        status: 'review_needed',
        message: 'This content has been queued for review due to potential conflicts with established canon.',
        conflicts: validation.conflicts.filter(c => c.severity !== 'soft'),
        suggestions: validation.suggestions,
      })
    }
    
    // If rejected (rare - only for truly problematic content)
    return NextResponse.json({
      success: false,
      published: false,
      status: 'rejected',
      message: 'This content could not be published. Please review the moderation guidelines.',
      issues: validation.checks.moderation.issues,
    })
    
  } catch (error) {
    console.error('Publishing pipeline error:', error)
    return NextResponse.json({ 
      error: 'Failed to process content',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Get the canon tier based on lane
 */
function getCanonTier(lane: CanonLane): string {
  switch (lane) {
    case 'instant':
      return 'Ambient Canon'
    case 'branch':
      return 'Branch Canon'
    case 'primary':
      return 'Pending Primary Canon'
    default:
      return 'Canon'
  }
}

/**
 * Get success message based on canon lane
 */
function getSuccessMessage(lane: CanonLane): string {
  switch (lane) {
    case 'instant':
      return '✨ Your creation is now part of the Everloop universe! It has been woven into the Ambient Canon.'
    case 'branch':
      return '🌿 Your creation has been added to Branch Canon. It connects beautifully with existing stories.'
    case 'primary':
      return '⭐ Your creation has been submitted for Primary Canon consideration. It may reshape the universe!'
    default:
      return 'Your creation has been published to Everloop.'
  }
}

/**
 * GET: Check publishing status
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const { searchParams } = new URL(request.url)
  const contentId = searchParams.get('contentId')
  const contentType = searchParams.get('contentType')
  
  if (!contentId || !contentType) {
    return NextResponse.json({ 
      error: 'Missing contentId or contentType parameter' 
    }, { status: 400 })
  }
  
  // Get publishing queue status
  const { data: queueEntry } = await supabase
    .from('publishing_queue')
    .select('*')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .single()
  
  // Get validation details
  const { data: validation } = await supabase
    .from('content_validations')
    .select('*')
    .eq('content_id', contentId)
    .eq('content_type', contentType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  return NextResponse.json({
    status: queueEntry?.status || 'not_found',
    canonLane: queueEntry?.canon_lane,
    publishedAt: queueEntry?.published_at,
    validation: validation ? {
      classification: validation.classification,
      confidence: validation.confidence_score,
      suggestions: validation.suggestions,
    } : null,
  })
}
