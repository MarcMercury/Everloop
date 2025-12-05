export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type StoryType = 'short' | 'long' | 'branch'
export type StoryStatus = 'draft' | 'pending_review' | 'in_review' | 'changes_requested' | 'approved' | 'rejected'
export type UserRole = 'admin' | 'author' | 'contributor'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          display_name: string | null
          role: UserRole
          has_accepted_rules: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name?: string | null
          role?: UserRole
          has_accepted_rules?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string | null
          role?: UserRole
          has_accepted_rules?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          author_id: string | null
          title: string
          type: StoryType
          status: StoryStatus
          content: string
          synopsis: string | null
          word_count: number
          is_canon: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id?: string | null
          title: string
          type: StoryType
          status?: StoryStatus
          content?: string
          synopsis?: string | null
          word_count?: number
          is_canon?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string | null
          title?: string
          type?: StoryType
          status?: StoryStatus
          content?: string
          synopsis?: string | null
          word_count?: number
          is_canon?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      story_metadata: {
        Row: {
          id: string
          story_id: string
          arc_ids: string[]
          location_ids: string[]
          character_ids: string[]
          time_period_id: string | null
          connection_note: string | null
          branch_from_story_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          story_id: string
          arc_ids?: string[]
          location_ids?: string[]
          character_ids?: string[]
          time_period_id?: string | null
          connection_note?: string | null
          branch_from_story_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          arc_ids?: string[]
          location_ids?: string[]
          character_ids?: string[]
          time_period_id?: string | null
          connection_note?: string | null
          branch_from_story_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      arcs: {
        Row: {
          id: string
          name: string
          description: string | null
          era: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          era?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          era?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          region: string | null
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          region?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          region?: string | null
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      characters: {
        Row: {
          id: string
          name: string
          description: string | null
          status: string | null
          traits: string[]
          is_locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          status?: string | null
          traits?: string[]
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          status?: string | null
          traits?: string[]
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      rules: {
        Row: {
          id: string
          category: string
          rule_text: string
          severity: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          rule_text: string
          severity?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          rule_text?: string
          severity?: string
          created_at?: string
          updated_at?: string
        }
      }
      time_periods: {
        Row: {
          id: string
          name: string
          description: string | null
          chronological_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          chronological_order: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          chronological_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      ai_commit_logs: {
        Row: {
          id: string
          story_id: string
          user_id: string
          ai_suggestion_snippet: string
          inserted_at: string
        }
        Insert: {
          id?: string
          story_id: string
          user_id: string
          ai_suggestion_snippet: string
          inserted_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          user_id?: string
          ai_suggestion_snippet?: string
          inserted_at?: string
        }
      }
      canon_reviews: {
        Row: {
          id: string
          story_id: string
          review_result: Json
          blocking_issues_count: number
          created_at: string
        }
        Insert: {
          id?: string
          story_id: string
          review_result: Json
          blocking_issues_count?: number
          created_at?: string
        }
        Update: {
          id?: string
          story_id?: string
          review_result?: Json
          blocking_issues_count?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      story_type: StoryType
      story_status: StoryStatus
      user_role: UserRole
    }
  }
}

// Convenience types for use throughout the app
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Story = Database['public']['Tables']['stories']['Row']
export type StoryMetadata = Database['public']['Tables']['story_metadata']['Row']
export type Arc = Database['public']['Tables']['arcs']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Character = Database['public']['Tables']['characters']['Row']
export type Rule = Database['public']['Tables']['rules']['Row']
export type TimePeriod = Database['public']['Tables']['time_periods']['Row']
export type AICommitLog = Database['public']['Tables']['ai_commit_logs']['Row']
export type CanonReview = Database['public']['Tables']['canon_reviews']['Row']

// Extended types with relations
export type StoryWithMetadata = Story & {
  story_metadata: StoryMetadata | null
  profiles: Pick<Profile, 'display_name'> | null
}

export type StoryWithDetails = Story & {
  story_metadata: StoryMetadata | null
  profiles: Pick<Profile, 'display_name'> | null
  arcs: Arc[]
  locations: Location[]
  characters: Character[]
  time_period: TimePeriod | null
}

// Canon Review Result structure
export interface CanonReviewResult {
  loreConflicts: {
    passage: string
    issue: string
    severity: 'blocking' | 'warning'
    suggestion: string
  }[]
  ruleViolations: {
    rule: string
    issue: string
    severity: 'blocking' | 'warning'
    suggestion: string
  }[]
  toneIssues: {
    passage: string
    issue: string
    severity: 'warning' | 'suggestion'
    suggestion: string
  }[]
  summary: string
  canApprove: boolean
}

// ============================================
// V2 TYPES - MAP LAB
// ============================================

export type MapVisibility = 'public_canon' | 'branch_canon' | 'private'
export type MapStatus = 'draft' | 'pending_review' | 'approved' | 'rejected'
export type MapElementType = 'mountain' | 'river' | 'bell_tree' | 'hollow' | 'drift_line' | 'fray_zone' | 'settlement' | 'shard_site' | 'ruin' | 'folded_structure' | 'custom'
export type StoryPathType = 'journey' | 'trade_route' | 'drift_passage' | 'fray_corridor' | 'ley_line'

export interface EverloopMap {
  id: string
  creator_id: string
  name: string
  description: string | null
  canvas_data: Json
  thumbnail_url: string | null
  visibility: MapVisibility
  status: MapStatus
  created_at: string
  updated_at: string
}

export interface MapElement {
  id: string
  map_id: string
  element_type: MapElementType
  name: string | null
  description: string | null
  x_position: number
  y_position: number
  scale: number
  rotation: number
  properties: Json
  linked_location_id: string | null
  created_at: string
}

export interface StoryPath {
  id: string
  map_id: string
  from_element_id: string
  to_element_id: string
  path_type: StoryPathType
  story_id: string | null
  description: string | null
  waypoints: Json
  created_at: string
}

// ============================================
// V2 TYPES - QUEST BUILDER
// ============================================

export type QuestType = 'lore' | 'mystery' | 'puzzle' | 'combat' | 'exploration' | 'drift_sequence'
export type QuestDifficulty = 'easy' | 'normal' | 'hard' | 'legendary'
export type QuestNodeType = 'start' | 'narrative' | 'choice' | 'puzzle' | 'combat' | 'reward' | 'ending'

export interface Quest {
  id: string
  creator_id: string
  title: string
  description: string | null
  quest_type: QuestType
  difficulty: QuestDifficulty
  estimated_time: number | null
  visibility: MapVisibility
  status: MapStatus
  linked_story_id: string | null
  linked_location_id: string | null
  start_node_id: string | null
  created_at: string
  updated_at: string
}

export interface QuestNode {
  id: string
  quest_id: string
  node_type: QuestNodeType
  title: string
  content: string | null
  x_position: number
  y_position: number
  properties: Json
  created_at: string
}

export interface QuestChoice {
  id: string
  from_node_id: string
  to_node_id: string
  choice_text: string
  requirements: Json
  consequences: Json
  created_at: string
}

export interface QuestNPC {
  id: string
  quest_id: string
  name: string
  description: string | null
  role: string | null
  dialogue: Json
  linked_character_id: string | null
  portrait_url: string | null
  created_at: string
}

// ============================================
// V2 TYPES - LOREFORGE
// ============================================

export type LoreEntryType = 'character' | 'location' | 'creature' | 'shard' | 'faction' | 'artifact' | 'mythology' | 'event' | 'species' | 'house' | 'religion' | 'other'

export interface LoreEntry {
  id: string
  creator_id: string
  entry_type: LoreEntryType
  name: string
  summary: string | null
  content: string | null
  tags: string[]
  ai_tags: string[]
  images: Json
  visibility: MapVisibility
  status: MapStatus
  properties: Json
  created_at: string
  updated_at: string
}

export interface LoreReference {
  id: string
  lore_entry_id: string
  reference_type: 'story' | 'quest' | 'map' | 'lore_entry'
  reference_id: string
  context: string | null
  created_at: string
}

export interface LoreTimeline {
  id: string
  lore_entry_id: string
  time_period_id: string | null
  event_date: string | null
  event_description: string | null
  created_at: string
}

// ============================================
// V2 TYPES - CREATURES & BESTIARY
// ============================================

export type ThreatLevel = 'harmless' | 'low' | 'moderate' | 'high' | 'extreme' | 'legendary'

export interface Creature {
  id: string
  creator_id: string
  name: string
  species_name: string | null
  is_species: boolean
  parent_species_id: string | null
  description: string | null
  habitat: string | null
  behavior: string | null
  fray_behavior: string | null
  threat_level: ThreatLevel | null
  abilities: Json
  weaknesses: Json
  image_url: string | null
  visibility: MapVisibility
  status: MapStatus
  created_at: string
  updated_at: string
}

// ============================================
// V2 TYPES - CHARACTER DESIGNER
// ============================================

export type PathRole = 'dreamer' | 'lantern' | 'weaver' | 'folded' | 'unbound' | 'herald' | 'keeper' | 'wanderer' | 'other'

export interface CharacterDetails {
  id: string
  character_id: string
  creator_id: string | null
  origin: string | null
  path_role: PathRole | null
  shard_alignment: Json
  emotional_arc: string | null
  physical_description: string | null
  fray_behavior: string | null
  abilities: Json
  relationships: Json
  portrait_url: string | null
  gallery: Json
  visibility: MapVisibility
  created_at: string
  updated_at: string
}

// ============================================
// V2 TYPES - WHAT IF GENERATOR
// ============================================

export interface WhatIfScenario {
  id: string
  creator_id: string
  prompt: string
  generated_content: string
  context_type: 'story' | 'location' | 'character' | 'quest' | 'general' | null
  context_id: string | null
  is_adopted: boolean
  adopted_to_story_id: string | null
  created_at: string
}

// ============================================
// V2 EXTENDED TYPES
// ============================================

export type MapWithElements = EverloopMap & {
  map_elements: MapElement[]
  story_paths: StoryPath[]
  profiles: Pick<Profile, 'display_name'> | null
}

export type QuestWithNodes = Quest & {
  quest_nodes: QuestNode[]
  quest_choices: QuestChoice[]
  quest_npcs: QuestNPC[]
  profiles: Pick<Profile, 'display_name'> | null
}

export type LoreEntryWithReferences = LoreEntry & {
  lore_references: LoreReference[]
  lore_timeline: LoreTimeline[]
  profiles: Pick<Profile, 'display_name'> | null
}

export type CharacterWithDetails = Character & {
  character_details: CharacterDetails | null
}
