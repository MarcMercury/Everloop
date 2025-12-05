-- Everloop V3 Schema: Auto-Canon & Frictionless Publishing
-- Run this AFTER schema.sql, seed.sql, and schema-v2.sql

-- Enable UUID extension (in case not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CANON LANES SYSTEM
-- ============================================

-- Canon Lane Types
DO $$ BEGIN
  CREATE TYPE canon_lane AS ENUM (
    'instant',      -- Auto-accepted, no review needed
    'branch',       -- Soft canon, touches existing content
    'primary'       -- Major impact, requires human review
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Content Classification
DO $$ BEGIN
  CREATE TYPE content_classification AS ENUM (
    'safe',             -- No issues detected
    'needs_adjustment', -- Minor fixes suggested
    'flagged',          -- Requires review
    'rejected'          -- Violates rules
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- CANON RULES ENGINE
-- ============================================

-- Canon Rules (what determines canonization)
CREATE TABLE IF NOT EXISTS canon_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rule_type TEXT NOT NULL CHECK (rule_type IN (
    'world_law',          -- Fundamental universe rules (Fold, Drift, Pattern, Shards)
    'metaphysics',        -- Core cosmology
    'timeline',           -- Historical consistency
    'geography',          -- Spatial consistency
    'character_integrity', -- Existing character protection
    'faction_politics',   -- Power dynamics
    'shard_behavior',     -- How Shards work
    'tone',               -- Style/atmosphere guidelines
    'content_policy'      -- Moderation rules
  )),
  name TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'soft' CHECK (severity IN ('soft', 'hard', 'absolute')),
  -- soft = AI can auto-reconcile
  -- hard = flags for branch canon
  -- absolute = blocks without human review
  check_function TEXT, -- Name of validation function
  auto_reconcile BOOLEAN DEFAULT TRUE, -- Can AI fix automatically?
  error_message TEXT,
  suggestion_template TEXT, -- Template for auto-fix suggestions
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- World Laws (immutable universal rules)
CREATE TABLE IF NOT EXISTS world_laws (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN (
    'fold', 'drift', 'pattern', 'shard', 'fray', 'weave', 'time', 'reality'
  )),
  description TEXT NOT NULL,
  cannot_be_contradicted TEXT[], -- Specific rules that cannot be broken
  can_be_expanded TEXT[], -- Areas open to expansion
  examples JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTENT VALIDATION SYSTEM
-- ============================================

-- Validation Results (AI analysis of submitted content)
CREATE TABLE IF NOT EXISTS content_validations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_type TEXT NOT NULL CHECK (content_type IN (
    'story', 'character', 'location', 'quest', 'map', 'creature', 'lore_entry'
  )),
  content_id UUID NOT NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Classification
  canon_lane canon_lane NOT NULL DEFAULT 'instant',
  classification content_classification NOT NULL DEFAULT 'safe',
  confidence_score FLOAT DEFAULT 1.0, -- AI confidence 0-1
  
  -- Analysis Results
  world_law_check JSONB DEFAULT '{}'::jsonb,
  metaphysics_check JSONB DEFAULT '{}'::jsonb,
  timeline_check JSONB DEFAULT '{}'::jsonb,
  geography_check JSONB DEFAULT '{}'::jsonb,
  character_check JSONB DEFAULT '{}'::jsonb,
  tone_check JSONB DEFAULT '{}'::jsonb,
  moderation_check JSONB DEFAULT '{}'::jsonb,
  
  -- Conflicts & Suggestions
  conflicts_detected JSONB DEFAULT '[]'::jsonb,
  auto_reconciliations JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  
  -- Status
  is_published BOOLEAN DEFAULT FALSE,
  published_at TIMESTAMPTZ,
  requires_review BOOLEAN DEFAULT FALSE,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MODERATION SYSTEM (High Tolerance)
-- ============================================

-- Moderation Rules (liberal, permissive)
CREATE TABLE IF NOT EXISTS moderation_rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rule_name TEXT NOT NULL,
  rule_type TEXT NOT NULL CHECK (rule_type IN (
    'block',    -- Absolutely not allowed
    'flag',     -- Review required
    'allow'     -- Explicitly permitted
  )),
  description TEXT,
  patterns TEXT[], -- Text patterns to check
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  action TEXT CHECK (action IN ('reject', 'queue', 'warn', 'pass')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Flags (when moderation trips)
CREATE TABLE IF NOT EXISTS content_flags (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  flag_type TEXT NOT NULL,
  flag_reason TEXT,
  flagged_by TEXT DEFAULT 'ai', -- 'ai' or user UUID
  severity TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PUBLISHING PIPELINE
-- ============================================

-- Publishing Queue (for content flow)
CREATE TABLE IF NOT EXISTS publishing_queue (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Pipeline Status
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',       -- Just submitted
    'validating',    -- AI checking
    'validated',     -- Passed checks
    'adjusting',     -- Auto-reconciliation in progress
    'ready',         -- Ready to publish
    'published',     -- Live in universe
    'review_needed', -- Requires human review
    'rejected'       -- Blocked
  )),
  
  -- Canon Assignment
  canon_lane canon_lane,
  canon_tier TEXT, -- 'ambient', 'branch', 'primary'
  
  -- Timing
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  validated_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  
  -- Validation Reference
  validation_id UUID REFERENCES content_validations(id),
  
  -- Priority (for review queue)
  priority INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CANON LOG (Public Contribution Record)
-- ============================================

-- Canon Contributions (public log of all additions)
CREATE TABLE IF NOT EXISTS canon_contributions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- What was contributed
  title TEXT NOT NULL,
  summary TEXT,
  contribution_type TEXT CHECK (contribution_type IN (
    'new_character', 'new_location', 'new_story', 'new_quest',
    'new_map', 'new_creature', 'new_lore', 'expansion', 'connection'
  )),
  
  -- Canon Status
  canon_lane canon_lane NOT NULL,
  canon_tier TEXT DEFAULT 'ambient',
  
  -- Connections
  weave_connections JSONB DEFAULT '[]'::jsonb, -- How it links to existing canon
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  
  -- Stats
  view_count INTEGER DEFAULT 0,
  reference_count INTEGER DEFAULT 0, -- How many other works reference this
  
  -- Timing
  published_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Featured/Highlighted
  is_featured BOOLEAN DEFAULT FALSE,
  featured_at TIMESTAMPTZ,
  featured_reason TEXT
);

-- ============================================
-- CREATOR STATS & REWARDS
-- ============================================

-- Creator Contributions Summary
CREATE TABLE IF NOT EXISTS creator_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- Counts
  total_contributions INTEGER DEFAULT 0,
  instant_canon_count INTEGER DEFAULT 0,
  branch_canon_count INTEGER DEFAULT 0,
  primary_canon_count INTEGER DEFAULT 0,
  
  -- Content Types
  stories_count INTEGER DEFAULT 0,
  characters_count INTEGER DEFAULT 0,
  locations_count INTEGER DEFAULT 0,
  quests_count INTEGER DEFAULT 0,
  maps_count INTEGER DEFAULT 0,
  creatures_count INTEGER DEFAULT 0,
  lore_entries_count INTEGER DEFAULT 0,
  
  -- Engagement
  total_views INTEGER DEFAULT 0,
  total_references INTEGER DEFAULT 0, -- How often others reference their work
  
  -- Achievements
  achievements JSONB DEFAULT '[]'::jsonb,
  
  -- Streak
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_contribution_at TIMESTAMPTZ,
  
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CANON COUNCIL (Future Feature)
-- ============================================

-- Canon Council Members
CREATE TABLE IF NOT EXISTS canon_council (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  role TEXT DEFAULT 'voter' CHECK (role IN ('voter', 'senior', 'arbiter')),
  specialty TEXT[], -- What areas they focus on
  join_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  votes_cast INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canon Votes (for Primary Canon decisions)
CREATE TABLE IF NOT EXISTS canon_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  voter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote TEXT CHECK (vote IN ('approve', 'reject', 'abstain', 'needs_revision')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, voter_id)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_canon_rules_type ON canon_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_content_validations_content ON content_validations(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_content_validations_creator ON content_validations(creator_id);
CREATE INDEX IF NOT EXISTS idx_content_validations_lane ON content_validations(canon_lane);
CREATE INDEX IF NOT EXISTS idx_publishing_queue_status ON publishing_queue(status);
CREATE INDEX IF NOT EXISTS idx_publishing_queue_creator ON publishing_queue(creator_id);
CREATE INDEX IF NOT EXISTS idx_canon_contributions_creator ON canon_contributions(creator_id);
CREATE INDEX IF NOT EXISTS idx_canon_contributions_type ON canon_contributions(content_type);
CREATE INDEX IF NOT EXISTS idx_canon_contributions_lane ON canon_contributions(canon_lane);
CREATE INDEX IF NOT EXISTS idx_content_flags_content ON content_flags(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_creator_stats_creator ON creator_stats(creator_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE canon_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_laws ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE canon_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE canon_council ENABLE ROW LEVEL SECURITY;
ALTER TABLE canon_votes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES
-- ============================================

-- Canon rules are public read
CREATE POLICY "Anyone can view canon rules" ON canon_rules FOR SELECT USING (true);

-- World laws are public read
CREATE POLICY "Anyone can view world laws" ON world_laws FOR SELECT USING (true);

-- Validations are private to creator
CREATE POLICY "Creators can view their validations" ON content_validations 
  FOR SELECT USING (creator_id = auth.uid());

-- Moderation rules are admin-only (service role)
CREATE POLICY "Admins can manage moderation rules" ON moderation_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Content flags are admin/creator viewable
CREATE POLICY "View content flags" ON content_flags
  FOR SELECT USING (
    flagged_by = auth.uid()::text OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'moderator'))
  );

-- Publishing queue - creators see their own
CREATE POLICY "Creators view their queue" ON publishing_queue
  FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "Creators can submit" ON publishing_queue
  FOR INSERT WITH CHECK (creator_id = auth.uid());

-- Canon contributions are public
CREATE POLICY "Anyone can view contributions" ON canon_contributions FOR SELECT USING (true);

-- Creator stats are public
CREATE POLICY "Anyone can view creator stats" ON creator_stats FOR SELECT USING (true);
CREATE POLICY "System updates creator stats" ON creator_stats FOR ALL USING (true);

-- Canon council is public read
CREATE POLICY "Anyone can view council" ON canon_council FOR SELECT USING (true);

-- Canon votes are public read
CREATE POLICY "Anyone can view votes" ON canon_votes FOR SELECT USING (true);
CREATE POLICY "Council members can vote" ON canon_votes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM canon_council WHERE member_id = auth.uid() AND is_active = TRUE)
  );

-- ============================================
-- SEED: WORLD LAWS (Immutable Universe Rules)
-- ============================================

INSERT INTO world_laws (name, category, description, cannot_be_contradicted, can_be_expanded) VALUES
  -- FOLD
  ('The Fold', 'fold', 'The Fold is the space between moments, where time folds upon itself. It is not a place but a state of being where past, present, and future coexist.', 
   ARRAY['The Fold cannot be destroyed', 'The Fold predates all civilizations', 'The Fold is not sentient but has patterns'],
   ARRAY['New Fold phenomena', 'Personal Fold experiences', 'Regional Fold variations']),
  
  -- DRIFT
  ('The Drift', 'drift', 'The Drift is the movement through the Fold, the passage between folded moments. Drifters are those who can navigate these passages.',
   ARRAY['Drift requires a connection to the Fold', 'Drift is not teleportation', 'Drift leaves traces'],
   ARRAY['Drift techniques', 'Drift paths', 'Drift dangers']),
  
  -- PATTERN
  ('The Pattern', 'pattern', 'The Pattern is the underlying structure of reality, the weave that holds all things together. Those who see the Pattern can perceive connections others cannot.',
   ARRAY['The Pattern is infinite', 'The Pattern cannot be fully comprehended', 'Breaking the Pattern has consequences'],
   ARRAY['Pattern reading methods', 'Pattern anomalies', 'Pattern communities']),
  
  -- SHARDS
  ('Shards', 'shard', 'Shards are crystallized moments of intense emotion or significance. They contain power and memory, and are sought by many.',
   ARRAY['Shards cannot be artificially created', 'Shards retain the emotions that formed them', 'Shards can be corrupted but not destroyed'],
   ARRAY['New shard types', 'Shard uses', 'Shard locations']),
  
  -- FRAY
  ('The Fray', 'fray', 'The Fray is where the Pattern weakens, where reality becomes uncertain. It is dangerous but also a source of possibility.',
   ARRAY['The Fray is spreading', 'The Fray distorts time and space', 'The Fray changes those who linger'],
   ARRAY['Fray zones', 'Fray creatures', 'Fray phenomena']),
  
  -- WEAVE
  ('The Weave', 'weave', 'The Weave is the collective story of all beings, the tapestry of existence that is constantly being written.',
   ARRAY['All beings are part of the Weave', 'The Weave remembers everything', 'The Weave can be read but not controlled'],
   ARRAY['Weave reading', 'Weave connections', 'Weave ceremonies'])
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED: CANON RULES
-- ============================================

INSERT INTO canon_rules (rule_type, name, description, severity, auto_reconcile, error_message, suggestion_template) VALUES
  -- World Law Rules
  ('world_law', 'Fold Consistency', 'Content must not contradict the fundamental nature of the Fold', 'absolute', FALSE, 
   'This contradicts the nature of the Fold.', 'Consider describing this as a Fold anomaly rather than changing what the Fold is.'),
  
  ('world_law', 'Shard Creation', 'Shards cannot be artificially created by any means', 'absolute', FALSE,
   'Shards cannot be artificially created.', 'Perhaps your character discovered or recovered a Shard instead of creating one.'),
  
  ('world_law', 'Pattern Integrity', 'The Pattern cannot be destroyed or fully controlled', 'absolute', FALSE,
   'The Pattern cannot be destroyed or controlled.', 'Your character might influence or read the Pattern, but cannot control it.'),
  
  -- Metaphysics (Hard but reconcilable)
  ('metaphysics', 'Drift Mechanics', 'Drift must follow established mechanics', 'hard', TRUE,
   'This Drift behavior seems inconsistent with established rules.', 'Consider adding a unique circumstance that explains this Drift variation.'),
  
  ('metaphysics', 'Fray Effects', 'Fray effects must be consistent with its nature', 'hard', TRUE,
   'The Fray effects described seem inconsistent.', 'The Fray can do many things, but always with an element of chaos and uncertainty.'),
  
  -- Timeline
  ('timeline', 'Historical Consistency', 'Events must not contradict established timeline', 'soft', TRUE,
   'This may conflict with established history.', 'Consider setting this in an unexplored time period or as an alternate interpretation.'),
  
  -- Geography
  ('geography', 'Spatial Consistency', 'Locations must not contradict established geography', 'soft', TRUE,
   'This location may conflict with existing geography.', 'Perhaps this is a newly discovered region or exists in a folded space.'),
  
  -- Character Integrity
  ('character_integrity', 'Canon Character Behavior', 'Major canon characters should act consistently', 'hard', TRUE,
   'This character behavior seems inconsistent with established personality.', 'Consider showing growth or circumstances that explain this change.'),
  
  -- Tone
  ('tone', 'World Tone', 'Content should match the mystical, contemplative tone of Everloop', 'soft', TRUE,
   'The tone may not match the Everloop atmosphere.', 'Consider adding more mystery and wonder to your narrative.'),
  
  -- Content Policy (blocking rules)
  ('content_policy', 'No Hate Speech', 'Content must not contain hate speech targeting real groups', 'absolute', FALSE,
   'This content contains prohibited hate speech.', NULL),
  
  ('content_policy', 'No Illegal Content', 'Content must not depict illegal activities involving minors', 'absolute', FALSE,
   'This content is not permitted.', NULL),
  
  ('content_policy', 'No Real Person Harm', 'Content must not depict harm to real, identifiable people', 'absolute', FALSE,
   'Content depicting harm to real people is not permitted.', NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED: MODERATION RULES (Liberal, High Tolerance)
-- ============================================

INSERT INTO moderation_rules (rule_name, rule_type, description, severity, action) VALUES
  -- BLOCK (absolute rejection)
  ('Hate Speech', 'block', 'Content targeting real-world groups with hatred', 'critical', 'reject'),
  ('CSAM', 'block', 'Any sexual content involving minors', 'critical', 'reject'),
  ('Real Person Harm', 'block', 'Detailed harm to real identifiable people', 'critical', 'reject'),
  ('Doxxing', 'block', 'Sharing private personal information', 'critical', 'reject'),
  
  -- FLAG (review required)
  ('Extreme Gore Details', 'flag', 'Gratuitous torture/gore beyond narrative necessity', 'high', 'queue'),
  ('Real World Violence Glorification', 'flag', 'Celebrating real-world atrocities', 'high', 'queue'),
  
  -- ALLOW (explicitly permitted)
  ('Adult Themes', 'allow', 'Mature themes, romance, relationships between adults', 'low', 'pass'),
  ('Violence', 'allow', 'Violence in service of narrative', 'low', 'pass'),
  ('Dark Themes', 'allow', 'Depression, trauma, psychological horror', 'low', 'pass'),
  ('Philosophy', 'allow', 'Philosophical exploration, moral ambiguity', 'low', 'pass'),
  ('Death', 'allow', 'Character death, mortality themes', 'low', 'pass'),
  ('Horror', 'allow', 'Horror elements, scary content', 'low', 'pass'),
  ('Political Themes', 'allow', 'In-universe political conflict and intrigue', 'low', 'pass'),
  ('Religion Themes', 'allow', 'In-universe religious exploration', 'low', 'pass'),
  ('Substance Use', 'allow', 'In-universe substances and their effects', 'low', 'pass'),
  ('Morally Gray', 'allow', 'Anti-heroes, villains with depth, moral complexity', 'low', 'pass')
ON CONFLICT DO NOTHING;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to increment creator stats
CREATE OR REPLACE FUNCTION increment_creator_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO creator_stats (creator_id, total_contributions, last_contribution_at)
  VALUES (NEW.creator_id, 1, NOW())
  ON CONFLICT (creator_id) DO UPDATE SET
    total_contributions = creator_stats.total_contributions + 1,
    last_contribution_at = NOW(),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for canon contributions
DROP TRIGGER IF EXISTS increment_stats_on_contribution ON canon_contributions;
CREATE TRIGGER increment_stats_on_contribution
  AFTER INSERT ON canon_contributions
  FOR EACH ROW EXECUTE FUNCTION increment_creator_stats();
