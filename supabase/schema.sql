-- Everloop Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types (with safe handling if they exist)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'author', 'contributor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE story_type AS ENUM ('short', 'long', 'branch');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE story_status AS ENUM ('draft', 'pending_review', 'in_review', 'changes_requested', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role user_role DEFAULT 'contributor',
  has_accepted_rules BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Periods (chronological eras in Everloop)
CREATE TABLE IF NOT EXISTS time_periods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  chronological_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Arcs (major story arcs in canon)
CREATE TABLE IF NOT EXISTS arcs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  era TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations (places in the Everloop universe)
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters (canon characters)
CREATE TABLE IF NOT EXISTS characters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT,
  traits TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Universe Rules
CREATE TABLE IF NOT EXISTS rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL,
  rule_text TEXT NOT NULL,
  severity TEXT DEFAULT 'standard',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories
CREATE TABLE IF NOT EXISTS stories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type story_type NOT NULL,
  status story_status DEFAULT 'draft',
  content TEXT DEFAULT '',
  synopsis TEXT,
  word_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Metadata (connections to canon)
CREATE TABLE IF NOT EXISTS story_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE UNIQUE NOT NULL,
  arc_ids UUID[] DEFAULT ARRAY[]::UUID[],
  location_ids UUID[] DEFAULT ARRAY[]::UUID[],
  character_ids UUID[] DEFAULT ARRAY[]::UUID[],
  time_period_id UUID REFERENCES time_periods(id),
  connection_note TEXT,
  branch_from_story_id UUID REFERENCES stories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Commit Logs (track AI suggestions that were accepted)
CREATE TABLE IF NOT EXISTS ai_commit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ai_suggestion_snippet TEXT NOT NULL,
  inserted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canon Reviews
CREATE TABLE IF NOT EXISTS canon_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  review_result JSONB NOT NULL DEFAULT '{}'::jsonb,
  blocking_issues_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stories_author ON stories(author_id);
CREATE INDEX IF NOT EXISTS idx_stories_status ON stories(status);
CREATE INDEX IF NOT EXISTS idx_stories_type ON stories(type);
CREATE INDEX IF NOT EXISTS idx_story_metadata_story ON story_metadata(story_id);
CREATE INDEX IF NOT EXISTS idx_ai_commit_logs_story ON ai_commit_logs(story_id);
CREATE INDEX IF NOT EXISTS idx_canon_reviews_story ON canon_reviews(story_id);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE arcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_commit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE canon_reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (safe to re-run)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Anyone can view approved stories" ON stories;
DROP POLICY IF EXISTS "Authors can insert their own stories" ON stories;
DROP POLICY IF EXISTS "Authors can update their own stories" ON stories;
DROP POLICY IF EXISTS "Authors can delete their own draft stories" ON stories;
DROP POLICY IF EXISTS "Metadata follows story permissions" ON story_metadata;
DROP POLICY IF EXISTS "Anyone can view arcs" ON arcs;
DROP POLICY IF EXISTS "Admins can manage arcs" ON arcs;
DROP POLICY IF EXISTS "Anyone can view locations" ON locations;
DROP POLICY IF EXISTS "Admins can manage locations" ON locations;
DROP POLICY IF EXISTS "Anyone can view characters" ON characters;
DROP POLICY IF EXISTS "Admins can manage characters" ON characters;
DROP POLICY IF EXISTS "Anyone can view rules" ON rules;
DROP POLICY IF EXISTS "Admins can manage rules" ON rules;
DROP POLICY IF EXISTS "Anyone can view time_periods" ON time_periods;
DROP POLICY IF EXISTS "Admins can manage time_periods" ON time_periods;
DROP POLICY IF EXISTS "Users can view their own AI logs" ON ai_commit_logs;
DROP POLICY IF EXISTS "Users can insert their own AI logs" ON ai_commit_logs;
DROP POLICY IF EXISTS "Authors can view reviews of their stories" ON canon_reviews;
DROP POLICY IF EXISTS "System can insert reviews" ON canon_reviews;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Stories policies
CREATE POLICY "Anyone can view approved stories" ON stories
  FOR SELECT USING (status = 'approved' OR author_id = auth.uid());

CREATE POLICY "Authors can insert their own stories" ON stories
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update their own stories" ON stories
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Authors can delete their own draft stories" ON stories
  FOR DELETE USING (author_id = auth.uid() AND status = 'draft');

-- Story metadata policies
CREATE POLICY "Metadata follows story permissions" ON story_metadata
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = story_metadata.story_id 
      AND (stories.author_id = auth.uid() OR stories.status = 'approved')
    )
  );

-- Canon entity policies - Everyone can read
CREATE POLICY "Anyone can view arcs" ON arcs FOR SELECT USING (true);
CREATE POLICY "Anyone can view locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Anyone can view characters" ON characters FOR SELECT USING (true);
CREATE POLICY "Anyone can view rules" ON rules FOR SELECT USING (true);
CREATE POLICY "Anyone can view time_periods" ON time_periods FOR SELECT USING (true);

-- Canon entity policies - Allow all for now (use service role for admin)
CREATE POLICY "Admins can manage arcs" ON arcs FOR ALL USING (true);
CREATE POLICY "Admins can manage locations" ON locations FOR ALL USING (true);
CREATE POLICY "Admins can manage characters" ON characters FOR ALL USING (true);
CREATE POLICY "Admins can manage rules" ON rules FOR ALL USING (true);
CREATE POLICY "Admins can manage time_periods" ON time_periods FOR ALL USING (true);

-- AI Commit Logs policies
CREATE POLICY "Users can view their own AI logs" ON ai_commit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own AI logs" ON ai_commit_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Canon Reviews policies
CREATE POLICY "Authors can view reviews of their stories" ON canon_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = canon_reviews.story_id AND stories.author_id = auth.uid())
  );

CREATE POLICY "System can insert reviews" ON canon_reviews
  FOR INSERT WITH CHECK (true);

-- Function to handle new user signup
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

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_stories_updated_at ON stories;
CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_story_metadata_updated_at ON story_metadata;
CREATE TRIGGER update_story_metadata_updated_at BEFORE UPDATE ON story_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_arcs_updated_at ON arcs;
CREATE TRIGGER update_arcs_updated_at BEFORE UPDATE ON arcs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_locations_updated_at ON locations;
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_characters_updated_at ON characters;
CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_rules_updated_at ON rules;
CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_time_periods_updated_at ON time_periods;
CREATE TRIGGER update_time_periods_updated_at BEFORE UPDATE ON time_periods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
