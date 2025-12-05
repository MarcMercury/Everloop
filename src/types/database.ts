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
          author_id: string
          title: string
          type: StoryType
          status: StoryStatus
          content: string
          synopsis: string | null
          word_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          type: StoryType
          status?: StoryStatus
          content?: string
          synopsis?: string | null
          word_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          type?: StoryType
          status?: StoryStatus
          content?: string
          synopsis?: string | null
          word_count?: number
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
