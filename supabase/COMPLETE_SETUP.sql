-- EVERLOOP COMPLETE DATABASE SETUP
-- Run this entire file in your Supabase SQL Editor to set up everything

-- ============================================
-- STEP 0: ENABLE EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STEP 1: CORE TABLES (from schema.sql)
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'contributor' CHECK (role IN ('contributor', 'author', 'admin')),
  has_completed_onboarding BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table
CREATE TABLE IF NOT EXISTS stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  synopsis TEXT,
  content JSONB DEFAULT '[]',
  word_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  time_period_id UUID,
  arc_id UUID,
  is_canon BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  title TEXT,
  description TEXT,
  role TEXT DEFAULT 'supporting' CHECK (role IN ('protagonist', 'antagonist', 'supporting', 'mentor', 'ally', 'rival', 'neutral')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deceased', 'unknown', 'missing')),
  backstory TEXT,
  personality_traits TEXT[],
  physical_description TEXT,
  abilities TEXT[],
  relationships TEXT,
  is_canon BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  region TEXT,
  terrain_type TEXT,
  significance TEXT,
  notable_features TEXT[],
  connected_locations UUID[],
  is_canon BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Lore entries table
CREATE TABLE IF NOT EXISTS lore_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  category TEXT DEFAULT 'general',
  tags TEXT[],
  is_canon BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Time periods table
CREATE TABLE IF NOT EXISTS time_periods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  start_year INTEGER,
  end_year INTEGER,
  is_canon BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Arcs table
CREATE TABLE IF NOT EXISTS arcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  is_canon BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Canon rules table
CREATE TABLE IF NOT EXISTS canon_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Story characters junction
CREATE TABLE IF NOT EXISTS story_characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  role_in_story TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, character_id)
);

-- Story locations junction
CREATE TABLE IF NOT EXISTS story_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(story_id, location_id)
);

-- Maps table
CREATE TABLE IF NOT EXISTS maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  map_type TEXT DEFAULT 'region',
  map_data JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quests table
CREATE TABLE IF NOT EXISTS quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT DEFAULT 'writing',
  difficulty TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'active',
  xp_reward INTEGER DEFAULT 100,
  requirements JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quest progress table
CREATE TABLE IF NOT EXISTS quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  status TEXT DEFAULT 'in_progress',
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(quest_id, user_id)
);

-- ============================================
-- STEP 2: CANON CONTRIBUTIONS (from schema-v3.sql)
-- ============================================

CREATE TABLE IF NOT EXISTS canon_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  contribution_type TEXT NOT NULL CHECK (contribution_type IN ('story', 'character', 'location', 'lore', 'arc', 'time_period')),
  reference_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  canon_impact TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS creator_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_stories INTEGER DEFAULT 0,
  canon_stories INTEGER DEFAULT 0,
  total_characters INTEGER DEFAULT 0,
  canon_characters INTEGER DEFAULT 0,
  total_locations INTEGER DEFAULT 0,
  canon_locations INTEGER DEFAULT 0,
  total_lore INTEGER DEFAULT 0,
  canon_lore INTEGER DEFAULT 0,
  reputation_score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- STEP 3: V5 COMMUNITY LAYER (from schema-v5.sql)
-- ============================================

CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  category TEXT DEFAULT 'general',
  requirements JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_displayed BOOLEAN DEFAULT TRUE,
  UNIQUE(user_id, badge_id)
);

CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER DEFAULT 10,
  category TEXT DEFAULT 'general',
  tier INTEGER DEFAULT 1,
  requirements JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

CREATE TABLE IF NOT EXISTS reputation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  total_score INTEGER DEFAULT 0,
  writing_score INTEGER DEFAULT 0,
  community_score INTEGER DEFAULT 0,
  canon_score INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS world_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT DEFAULT 'seasonal' CHECK (event_type IN ('seasonal', 'special', 'community', 'challenge')),
  theme TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  rewards JSONB DEFAULT '{}',
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES world_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  submission_type TEXT NOT NULL,
  reference_id UUID,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('submitted', 'approved', 'rejected', 'winner')),
  score INTEGER DEFAULT 0,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id, submission_type)
);

CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- ============================================
-- STEP 4: ROW LEVEL SECURITY
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Stories policies
DROP POLICY IF EXISTS "Published stories are viewable by everyone" ON stories;
CREATE POLICY "Published stories are viewable by everyone" ON stories FOR SELECT USING (status = 'approved' OR author_id = auth.uid());

DROP POLICY IF EXISTS "Users can create stories" ON stories;
CREATE POLICY "Users can create stories" ON stories FOR INSERT WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can update own stories" ON stories;
CREATE POLICY "Users can update own stories" ON stories FOR UPDATE USING (auth.uid() = author_id);

DROP POLICY IF EXISTS "Users can delete own stories" ON stories;
CREATE POLICY "Users can delete own stories" ON stories FOR DELETE USING (auth.uid() = author_id);

-- Characters policies
DROP POLICY IF EXISTS "Characters are viewable by everyone" ON characters;
CREATE POLICY "Characters are viewable by everyone" ON characters FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create characters" ON characters;
CREATE POLICY "Users can create characters" ON characters FOR INSERT WITH CHECK (auth.uid() = created_by);

DROP POLICY IF EXISTS "Users can update own characters" ON characters;
CREATE POLICY "Users can update own characters" ON characters FOR UPDATE USING (auth.uid() = created_by OR is_canon = false);

-- Locations policies
DROP POLICY IF EXISTS "Locations are viewable by everyone" ON locations;
CREATE POLICY "Locations are viewable by everyone" ON locations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create locations" ON locations;
CREATE POLICY "Users can create locations" ON locations FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Lore policies
DROP POLICY IF EXISTS "Lore is viewable by everyone" ON lore_entries;
CREATE POLICY "Lore is viewable by everyone" ON lore_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create lore" ON lore_entries;
CREATE POLICY "Users can create lore" ON lore_entries FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Maps policies
DROP POLICY IF EXISTS "Public maps viewable by everyone" ON maps;
CREATE POLICY "Public maps viewable by everyone" ON maps FOR SELECT USING (is_public = true OR created_by = auth.uid());

DROP POLICY IF EXISTS "Users can create maps" ON maps;
CREATE POLICY "Users can create maps" ON maps FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Quests policies
DROP POLICY IF EXISTS "Quests are viewable by everyone" ON quests;
CREATE POLICY "Quests are viewable by everyone" ON quests FOR SELECT USING (true);

-- ============================================
-- STEP 5: TRIGGERS FOR AUTO-PROFILE CREATION
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 6: SEED INITIAL DATA
-- ============================================

-- Insert time periods
INSERT INTO time_periods (name, description, start_year, end_year, is_canon) VALUES
  ('The Shaping Era', 'When the Loop was formed and reality first stabilized', -10000, -5000, true),
  ('Pre-Collapse', 'The golden age before the first major timeline fracture', -5000, 0, true),
  ('Post-Collapse', 'Recovery period after the Great Unraveling', 0, 500, true),
  ('The Anchor Age', 'Current era, where Anchors maintain stability', 500, 1000, true)
ON CONFLICT DO NOTHING;

-- Insert arcs
INSERT INTO arcs (name, description, status, is_canon) VALUES
  ('The Hollow Queen', 'The rise and fall of the Hollow Queen who sought to unloop reality', 'completed', true),
  ('Thread of Myx', 'Following the mysterious figure Myx who weaves between timelines', 'active', true),
  ('Anchor''s Call', 'New Anchors are awakening across the Loop', 'active', true)
ON CONFLICT DO NOTHING;

-- Insert canon rules
INSERT INTO canon_rules (title, description, category, priority) VALUES
  ('The Loop is Stable', 'Time flows in cycles, not lines. Events repeat with variations.', 'cosmology', 1),
  ('Anchors Maintain Balance', 'Anchors are beings who can perceive and influence the Loop.', 'characters', 2),
  ('Memory Bleeds', 'Strong emotions can cause memories to bleed between timeline iterations.', 'mechanics', 3),
  ('The Hollows Exist', 'Spaces between loops where reality is thin and unstable.', 'locations', 4),
  ('Canon is Collaborative', 'All approved stories become part of the shared universe.', 'meta', 5)
ON CONFLICT DO NOTHING;

-- Insert starter badges
INSERT INTO badges (name, description, icon, rarity, category) VALUES
  ('First Words', 'Wrote your first story in Everloop', '✍️', 'common', 'writing'),
  ('Canon Contributor', 'Had a story approved as canon', '📜', 'rare', 'canon'),
  ('Worldbuilder', 'Created 5 locations in Everloop', '🌍', 'uncommon', 'creation'),
  ('Character Crafter', 'Created 5 characters in Everloop', '👤', 'uncommon', 'creation'),
  ('Lorekeeper', 'Added 10 lore entries', '📚', 'rare', 'creation'),
  ('Anchor Awakened', 'Completed your first quest', '⚓', 'common', 'quests'),
  ('Loop Master', 'Had 10 stories approved as canon', '🔄', 'legendary', 'canon')
ON CONFLICT DO NOTHING;

-- Insert starter achievements
INSERT INTO achievements (name, description, icon, points, category, tier) VALUES
  ('Welcome to the Loop', 'Complete the onboarding tutorial', '👋', 10, 'onboarding', 1),
  ('Storyteller', 'Write your first complete story', '📖', 25, 'writing', 1),
  ('Prolific Writer', 'Write 10,000 words across all stories', '✒️', 50, 'writing', 2),
  ('Canon Voice', 'Have your first story become canon', '🏆', 100, 'canon', 2),
  ('Master of Loops', 'Contribute to all major arcs', '🌀', 200, 'canon', 3)
ON CONFLICT DO NOTHING;

-- Insert sample characters for the glossary (canon characters without created_by)
INSERT INTO characters (id, name, title, description, role, status, is_canon, personality_traits, abilities) VALUES
  ('c0000001-0001-0001-0001-000000000001', 'Lyric', 'The First Anchor', 'The original Anchor who discovered how to perceive the Loop. Their sacrifice created the Anchor lineage.', 'protagonist', 'deceased', true, ARRAY['wise', 'determined', 'sacrificial'], ARRAY['Loop Perception', 'Timeline Walking', 'Memory Weaving']),
  ('c0000002-0001-0001-0001-000000000002', 'Eryn', 'Keeper of Echoes', 'A young Anchor learning to control their abilities while haunted by memories from other loops.', 'protagonist', 'active', true, ARRAY['curious', 'empathetic', 'uncertain'], ARRAY['Echo Reading', 'Emotional Resonance']),
  ('c0000003-0001-0001-0001-000000000003', 'Rook', 'The Hollow King', 'Once an Anchor, now corrupted by exposure to the Hollows. Seeks to collapse the Loop entirely.', 'antagonist', 'active', true, ARRAY['cunning', 'bitter', 'powerful'], ARRAY['Hollow Walking', 'Reality Corruption', 'Timeline Fracturing']),
  ('c0000004-0001-0001-0001-000000000004', 'Myx', 'Thread-Walker', 'A mysterious figure who appears across all timelines, never quite the same. Their true nature is unknown.', 'neutral', 'unknown', true, ARRAY['enigmatic', 'playful', 'ancient'], ARRAY['Thread Weaving', 'Identity Shifting', 'Prophecy'])
ON CONFLICT (id) DO NOTHING;

-- Insert sample locations (canon locations without created_by)
INSERT INTO locations (id, name, description, region, terrain_type, significance, is_canon, notable_features) VALUES
  ('a0000001-0001-0001-0001-000000000001', 'The Bell Tree', 'A massive crystalline tree at the center of the world. Its chimes mark the turning of each Loop.', 'Central Axis', 'mystical', 'The heart of the Loop, where all timelines converge', true, ARRAY['Crystal chimes', 'Glowing roots', 'Portal to the Hollows']),
  ('a0000002-0001-0001-0001-000000000002', 'The Hollows', 'Spaces between loops where reality is thin. Time moves strangely here, and the unwary can be lost forever.', 'Interstitial', 'void', 'Dangerous passages between timeline iterations', true, ARRAY['Shifting geometry', 'Echo fragments', 'Lost memories']),
  ('a0000003-0001-0001-0001-000000000003', 'Stillwood', 'A forest where time moves extremely slowly. A moment outside is a year within.', 'Eastern Reaches', 'forest', 'Sanctuary for those fleeing the Loop', true, ARRAY['Ancient trees', 'Time dilation', 'Hidden settlements']),
  ('a0000004-0001-0001-0001-000000000004', 'The Drift-Lines', 'Rivers of temporal energy that flow across the world. Touching them can shift you between loops.', 'Worldwide', 'energy', 'Natural transit between timeline variations', true, ARRAY['Glowing currents', 'Random destinations', 'Temporal fish'])
ON CONFLICT (id) DO NOTHING;

-- Setup complete! All tables, policies, and seed data have been created.
