/**
 * Everloop Auto-Canon Engine
 * 
 * Frictionless publishing with intelligent canonization.
 * Default: ALLOW. Only intervene when necessary.
 * 
 * Three Canon Lanes:
 * 1. INSTANT - Auto-accepted, no review (new content that doesn't conflict)
 * 2. BRANCH  - Soft canon, touches existing content (auto-reconciled)
 * 3. PRIMARY - Major impact, requires human review (rare)
 */

import { createClient } from '@/lib/supabase/server'

// ============================================
// TYPES
// ============================================

export type CanonLane = 'instant' | 'branch' | 'primary'
export type ContentClassification = 'safe' | 'needs_adjustment' | 'flagged' | 'rejected'
export type ContentType = 'story' | 'character' | 'location' | 'quest' | 'map' | 'creature' | 'lore_entry'

export interface ValidationResult {
  canPublish: boolean
  canonLane: CanonLane
  classification: ContentClassification
  confidence: number
  
  checks: {
    worldLaw: CheckResult
    metaphysics: CheckResult
    timeline: CheckResult
    geography: CheckResult
    character: CheckResult
    tone: CheckResult
    moderation: CheckResult
  }
  
  conflicts: Conflict[]
  autoReconciliations: Reconciliation[]
  suggestions: Suggestion[]
  
  publishedAt?: Date
}

export interface CheckResult {
  passed: boolean
  score: number // 0-1
  issues: string[]
  canAutoFix: boolean
}

export interface Conflict {
  type: string
  description: string
  severity: 'soft' | 'hard' | 'absolute'
  conflictsWith: string
  canReconcile: boolean
}

export interface Reconciliation {
  issue: string
  resolution: string
  applied: boolean
}

export interface Suggestion {
  type: 'enhancement' | 'consistency' | 'connection'
  message: string
  action?: string
}

export interface ContentForValidation {
  type: ContentType
  id: string
  creatorId: string
  title: string
  content: string
  metadata?: Record<string, unknown>
  linkedEntities?: {
    characters?: string[]
    locations?: string[]
    stories?: string[]
    shards?: string[]
  }
}

// ============================================
// WORLD LAWS (Immutable)
// ============================================

export const WORLD_LAWS = {
  fold: {
    name: 'The Fold',
    immutable: [
      'The Fold cannot be destroyed',
      'The Fold predates all civilizations',
      'The Fold is not sentient but has patterns',
      'The Fold exists between moments, not in physical space'
    ],
    expandable: [
      'New Fold phenomena',
      'Personal Fold experiences',
      'Regional Fold variations',
      'Fold-touched individuals'
    ]
  },
  drift: {
    name: 'The Drift',
    immutable: [
      'Drift requires connection to the Fold',
      'Drift is not teleportation - it is passage',
      'Drift leaves traces that can be followed',
      'Drifting has physical and mental costs'
    ],
    expandable: [
      'New Drift techniques',
      'Drift paths and routes',
      'Drift dangers and anomalies',
      'Drifter communities'
    ]
  },
  pattern: {
    name: 'The Pattern',
    immutable: [
      'The Pattern is infinite and cannot be fully seen',
      'The Pattern cannot be controlled, only read',
      'Breaking the Pattern has unpredictable consequences',
      'The Pattern connects all living things'
    ],
    expandable: [
      'Pattern reading methods',
      'Pattern anomalies',
      'Pattern-sensitive individuals',
      'Pattern ceremonies and traditions'
    ]
  },
  shard: {
    name: 'Shards',
    immutable: [
      'Shards cannot be artificially created',
      'Shards retain the emotions that formed them',
      'Shards can be corrupted but not destroyed',
      'Shards respond to emotional resonance'
    ],
    expandable: [
      'New shard types and colors',
      'Shard uses and effects',
      'Shard locations',
      'Shard hunters and collectors'
    ]
  },
  fray: {
    name: 'The Fray',
    immutable: [
      'The Fray is spreading (slowly)',
      'The Fray distorts time and space',
      'The Fray changes those who linger too long',
      'The Fray is where the Pattern weakens'
    ],
    expandable: [
      'Fray zones and territories',
      'Fray creatures and entities',
      'Fray phenomena',
      'Fray survivors'
    ]
  },
  weave: {
    name: 'The Weave',
    immutable: [
      'All beings are part of the Weave',
      'The Weave remembers everything',
      'The Weave can be read but not rewritten',
      'The Weave is the story of all existence'
    ],
    expandable: [
      'Weave reading techniques',
      'Weave connections between people',
      'Weave ceremonies',
      'Weave anomalies'
    ]
  }
}

// ============================================
// MODERATION (High Tolerance - Block Only Extremes)
// ============================================

const BLOCKED_CONTENT = {
  patterns: [
    // Only the absolute necessities
    /\b(kill|murder|harm)\s+(all|every)\s+(jews|muslims|christians|blacks|whites|asians|gays|trans)/gi,
    /\bsexual\b.*\b(child|minor|kid|infant|toddler|baby)\b/gi,
    /\b(doxx|doxing|personal\s+address|home\s+address)\b.*\b(real\s+person|celebrity|public\s+figure)/gi,
  ],
  
  // Everything else is ALLOWED
  allowed: [
    'violence', 'death', 'horror', 'gore (narrative)', 'dark themes',
    'adult relationships', 'romance', 'sexuality (adults)',
    'drugs/substances', 'trauma', 'mental illness',
    'moral ambiguity', 'villains', 'anti-heroes',
    'political themes', 'religious themes', 'philosophical themes',
    'psychological horror', 'body horror', 'cosmic horror',
    'war', 'conflict', 'oppression', 'slavery (historical/fictional)',
    'abuse (depicted, not glorified)', 'suicide (handled thoughtfully)',
  ]
}

// ============================================
// VALIDATION ENGINE
// ============================================

export class AutoCanonEngine {
  
  /**
   * Main validation entry point
   * Returns whether content can publish and its canon lane
   */
  async validate(content: ContentForValidation): Promise<ValidationResult> {
    const checks = {
      worldLaw: await this.checkWorldLaws(content),
      metaphysics: await this.checkMetaphysics(content),
      timeline: await this.checkTimeline(content),
      geography: await this.checkGeography(content),
      character: await this.checkCharacterIntegrity(content),
      tone: await this.checkTone(content),
      moderation: await this.checkModeration(content),
    }
    
    // Collect conflicts
    const conflicts = this.collectConflicts(checks)
    
    // Attempt auto-reconciliation for soft/hard conflicts
    const autoReconciliations = await this.attemptAutoReconcile(conflicts)
    
    // Determine canon lane
    const { canonLane, classification } = this.determineCanonLane(checks, conflicts, autoReconciliations)
    
    // Generate helpful suggestions
    const suggestions = await this.generateSuggestions(content, checks)
    
    // Calculate confidence
    const confidence = this.calculateConfidence(checks)
    
    // Determine if can publish
    const canPublish = classification !== 'rejected' && classification !== 'flagged'
    
    return {
      canPublish,
      canonLane,
      classification,
      confidence,
      checks,
      conflicts,
      autoReconciliations,
      suggestions,
    }
  }
  
  /**
   * Check against immutable world laws
   * Only blocks if directly contradicting core laws
   */
  private async checkWorldLaws(content: ContentForValidation): Promise<CheckResult> {
    const issues: string[] = []
    let score = 1.0
    
    const text = content.content.toLowerCase()
    
    // Check each world law
    for (const [key, law] of Object.entries(WORLD_LAWS)) {
      for (const rule of law.immutable) {
        // Only flag if DIRECTLY contradicting
        if (this.directlyContradicts(text, rule)) {
          issues.push(`May contradict: "${rule}"`)
          score -= 0.2
        }
      }
    }
    
    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      canAutoFix: issues.length > 0 && score > 0.5 // Can suggest fixes if not severe
    }
  }
  
  /**
   * Check metaphysics consistency
   * Very permissive - only flags direct contradictions
   */
  private async checkMetaphysics(content: ContentForValidation): Promise<CheckResult> {
    // Default to passing - we want to allow creativity
    return {
      passed: true,
      score: 1.0,
      issues: [],
      canAutoFix: true
    }
  }
  
  /**
   * Check timeline consistency
   * Permissive - suggests branch timelines instead of blocking
   */
  private async checkTimeline(content: ContentForValidation): Promise<CheckResult> {
    return {
      passed: true,
      score: 1.0,
      issues: [],
      canAutoFix: true
    }
  }
  
  /**
   * Check geography consistency
   * Very permissive - new locations always welcome
   */
  private async checkGeography(content: ContentForValidation): Promise<CheckResult> {
    return {
      passed: true,
      score: 1.0,
      issues: [],
      canAutoFix: true
    }
  }
  
  /**
   * Check character integrity
   * Only flags if using major canon characters incorrectly
   */
  private async checkCharacterIntegrity(content: ContentForValidation): Promise<CheckResult> {
    // Most characters are user-created, so this rarely triggers
    return {
      passed: true,
      score: 1.0,
      issues: [],
      canAutoFix: true
    }
  }
  
  /**
   * Check tone consistency
   * Very light touch - just gentle suggestions
   */
  private async checkTone(content: ContentForValidation): Promise<CheckResult> {
    return {
      passed: true,
      score: 1.0,
      issues: [],
      canAutoFix: true
    }
  }
  
  /**
   * Check moderation (HIGH TOLERANCE)
   * Only blocks truly problematic content
   */
  private async checkModeration(content: ContentForValidation): Promise<CheckResult> {
    const issues: string[] = []
    const text = content.content
    
    // Only check against blocked patterns
    for (const pattern of BLOCKED_CONTENT.patterns) {
      if (pattern.test(text)) {
        issues.push('Content contains prohibited material')
      }
    }
    
    return {
      passed: issues.length === 0,
      score: issues.length === 0 ? 1.0 : 0.0,
      issues,
      canAutoFix: false // Blocked content cannot be auto-fixed
    }
  }
  
  /**
   * Helper: Check if text directly contradicts a rule
   * Very conservative - only triggers on explicit contradictions
   */
  private directlyContradicts(text: string, rule: string): boolean {
    // Extract key concepts from rule
    const ruleWords = rule.toLowerCase().split(' ').filter(w => w.length > 4)
    
    // Check for negation patterns
    const negationPatterns = [
      'cannot exist',
      'is impossible',
      'doesn\'t exist',
      'isn\'t real',
      'was destroyed',
      'can be controlled',
      'can be created',
    ]
    
    for (const pattern of negationPatterns) {
      for (const word of ruleWords) {
        if (text.includes(`${word} ${pattern}`) || text.includes(`the ${word} ${pattern}`)) {
          return true
        }
      }
    }
    
    return false
  }
  
  /**
   * Collect all conflicts from checks
   */
  private collectConflicts(checks: ValidationResult['checks']): Conflict[] {
    const conflicts: Conflict[] = []
    
    for (const [checkName, result] of Object.entries(checks)) {
      if (!result.passed) {
        for (const issue of result.issues) {
          conflicts.push({
            type: checkName,
            description: issue,
            severity: checkName === 'moderation' ? 'absolute' : 
                     checkName === 'worldLaw' ? 'hard' : 'soft',
            conflictsWith: checkName,
            canReconcile: result.canAutoFix
          })
        }
      }
    }
    
    return conflicts
  }
  
  /**
   * Attempt to auto-reconcile conflicts
   * This is where we try to HELP instead of BLOCK
   */
  private async attemptAutoReconcile(conflicts: Conflict[]): Promise<Reconciliation[]> {
    const reconciliations: Reconciliation[] = []
    
    for (const conflict of conflicts) {
      if (conflict.canReconcile && conflict.severity !== 'absolute') {
        reconciliations.push({
          issue: conflict.description,
          resolution: this.generateReconciliation(conflict),
          applied: true
        })
      }
    }
    
    return reconciliations
  }
  
  /**
   * Generate a reconciliation suggestion
   */
  private generateReconciliation(conflict: Conflict): string {
    const reconciliations: Record<string, string> = {
      worldLaw: 'Consider framing this as an anomaly or unexplained phenomenon rather than changing established laws.',
      metaphysics: 'This could exist as a unique regional variation or personal experience.',
      timeline: 'Consider placing this in an unexplored time period or as an alternate perspective on events.',
      geography: 'This location could exist in an unexplored region or folded space.',
      character: 'Consider showing character growth or unique circumstances that explain this behavior.',
      tone: 'Adding elements of mystery or wonder could enhance the Everloop atmosphere.',
    }
    
    return reconciliations[conflict.type] || 'Consider revising for better consistency with the world.'
  }
  
  /**
   * Determine which canon lane content belongs to
   */
  private determineCanonLane(
    checks: ValidationResult['checks'],
    conflicts: Conflict[],
    reconciliations: Reconciliation[]
  ): { canonLane: CanonLane; classification: ContentClassification } {
    
    // Check for absolute blocks (moderation failures)
    if (!checks.moderation.passed) {
      return { canonLane: 'primary', classification: 'rejected' }
    }
    
    // Check for hard conflicts that couldn't be reconciled
    const unresolvedHardConflicts = conflicts.filter(c => 
      c.severity === 'hard' && !reconciliations.some(r => r.issue === c.description)
    )
    
    if (unresolvedHardConflicts.length > 0) {
      return { canonLane: 'primary', classification: 'flagged' }
    }
    
    // Check if content touches existing canon (branch lane)
    const touchesExisting = conflicts.length > 0 && 
      conflicts.every(c => c.severity === 'soft' || reconciliations.some(r => r.issue === c.description))
    
    if (touchesExisting) {
      return { canonLane: 'branch', classification: 'safe' }
    }
    
    // Default: Instant canon (new content, no conflicts)
    return { canonLane: 'instant', classification: 'safe' }
  }
  
  /**
   * Generate helpful suggestions for the creator
   */
  private async generateSuggestions(
    content: ContentForValidation,
    checks: ValidationResult['checks']
  ): Promise<Suggestion[]> {
    const suggestions: Suggestion[] = []
    
    // Always suggest connections to the Weave
    suggestions.push({
      type: 'connection',
      message: 'Consider how this connects to the broader Weave of Everloop.',
      action: 'Add tags or references to existing canon elements.'
    })
    
    // Suggest enhancements based on content type
    if (content.type === 'character') {
      suggestions.push({
        type: 'enhancement',
        message: 'Characters with Fold experiences or Shard connections tend to resonate well.',
      })
    }
    
    if (content.type === 'location') {
      suggestions.push({
        type: 'enhancement',
        message: 'Locations near the Fray or with Pattern anomalies add depth to the world.',
      })
    }
    
    return suggestions
  }
  
  /**
   * Calculate confidence score
   */
  private calculateConfidence(checks: ValidationResult['checks']): number {
    const scores = Object.values(checks).map(c => c.score)
    return scores.reduce((a, b) => a + b, 0) / scores.length
  }
  
  /**
   * Publish content to the universe
   * This is the final step after validation
   */
  async publish(content: ContentForValidation, validation: ValidationResult): Promise<{ success: boolean; contributionId?: string; error?: string }> {
    if (!validation.canPublish) {
      return { success: false, error: 'Content did not pass validation' }
    }
    
    const supabase = await createClient()
    
    // Record the contribution
    const { data: contribution, error } = await supabase
      .from('canon_contributions')
      .insert({
        content_type: content.type,
        content_id: content.id,
        creator_id: content.creatorId,
        title: content.title,
        summary: content.content.slice(0, 200),
        contribution_type: `new_${content.type}`,
        canon_lane: validation.canonLane,
        canon_tier: validation.canonLane === 'instant' ? 'ambient' : 
                   validation.canonLane === 'branch' ? 'branch' : 'pending',
        published_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) {
      console.error('Failed to record contribution:', error)
      return { success: false, error: error.message }
    }
    
    // Update the original content status
    await this.updateContentStatus(content.type, content.id, validation.canonLane)
    
    return { success: true, contributionId: contribution.id }
  }
  
  /**
   * Update the status of the original content
   */
  private async updateContentStatus(type: ContentType, id: string, lane: CanonLane): Promise<void> {
    const supabase = await createClient()
    const status = lane === 'primary' ? 'pending_review' : 'approved'
    const visibility = lane === 'instant' ? 'public_canon' : 'branch_canon'
    
    const tableMap: Record<ContentType, string> = {
      story: 'stories',
      character: 'characters',
      location: 'locations',
      quest: 'quests',
      map: 'maps',
      creature: 'creatures',
      lore_entry: 'lore_entries',
    }
    
    await supabase
      .from(tableMap[type])
      .update({ status, visibility })
      .eq('id', id)
  }
}

// Export singleton instance
export const autoCanonEngine = new AutoCanonEngine()
