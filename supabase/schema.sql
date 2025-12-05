-- Everloop Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'author', 'contributor');
CREATE TYPE story_type AS ENUM ('short', 'long', 'branch');
CREATE TYPE story_status AS ENUM ('draft', 'pending_review', 'in_review', 'changes_requested', 'approved', 'rejected');

-- Profiles table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  display_name TEXT,
  role user_role DEFAULT 'contributor',
  has_accepted_rules BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Time Periods (chronological eras in Everloop)
CREATE TABLE time_periods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  chronological_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Arcs (major story arcs in canon)
CREATE TABLE arcs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  era TEXT,
  status TEXT DEFAULT 'open', -- open, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations (places in the Everloop universe)
CREATE TABLE locations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Characters (canon characters)
CREATE TABLE characters (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT, -- alive, deceased, unknown, etc.
  traits TEXT[] DEFAULT '{}',
  is_locked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Universe Rules
CREATE TABLE rules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category TEXT NOT NULL, -- magic, history, geography, metaphysics, etc.
  rule_text TEXT NOT NULL,
  severity TEXT DEFAULT 'standard', -- critical, standard, guideline
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stories
CREATE TABLE stories (
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
CREATE TABLE story_metadata (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE UNIQUE NOT NULL,
  arc_ids UUID[] DEFAULT '{}',
  location_ids UUID[] DEFAULT '{}',
  character_ids UUID[] DEFAULT '{}',
  time_period_id UUID REFERENCES time_periods(id),
  connection_note TEXT,
  branch_from_story_id UUID REFERENCES stories(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI Commit Logs (track AI suggestions that were accepted)
CREATE TABLE ai_commit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  ai_suggestion_snippet TEXT NOT NULL,
  inserted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Canon Reviews
CREATE TABLE canon_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE NOT NULL,
  review_result JSONB NOT NULL,
  blocking_issues_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_stories_author ON stories(author_id);
CREATE INDEX idx_stories_status ON stories(status);
CREATE INDEX idx_stories_type ON stories(type);
CREATE INDEX idx_story_metadata_story ON story_metadata(story_id);
CREATE INDEX idx_ai_commit_logs_story ON ai_commit_logs(story_id);
CREATE INDEX idx_canon_reviews_story ON canon_reviews(story_id);

-- Row Level Security Policies

-- Enable RLS on all tables
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

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Stories policies
CREATE POLICY "Anyone can view approved stories" ON stories
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Authors can view their own stories" ON stories
  FOR SELECT USING (author_id = auth.uid());

CREATE POLICY "Authors can insert their own stories" ON stories
  FOR INSERT WITH CHECK (author_id = auth.uid());

CREATE POLICY "Authors can update their own stories" ON stories
  FOR UPDATE USING (author_id = auth.uid());

CREATE POLICY "Authors can delete their own draft stories" ON stories
  FOR DELETE USING (author_id = auth.uid() AND status = 'draft');

CREATE POLICY "Admins can do anything with stories" ON stories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Story metadata policies
CREATE POLICY "Metadata follows story permissions" ON story_metadata
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM stories 
      WHERE stories.id = story_metadata.story_id 
      AND (stories.author_id = auth.uid() OR stories.status = 'approved')
    )
  );

CREATE POLICY "Admins can manage all metadata" ON story_metadata
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Canon entity policies (arcs, locations, characters, rules, time_periods)
-- Everyone can read, only admins can modify

CREATE POLICY "Anyone can view arcs" ON arcs FOR SELECT USING (true);
CREATE POLICY "Admins can manage arcs" ON arcs FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Admins can manage locations" ON locations FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view characters" ON characters FOR SELECT USING (true);
CREATE POLICY "Admins can manage characters" ON characters FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view rules" ON rules FOR SELECT USING (true);
CREATE POLICY "Admins can manage rules" ON rules FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Anyone can view time_periods" ON time_periods FOR SELECT USING (true);
CREATE POLICY "Admins can manage time_periods" ON time_periods FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- AI Commit Logs policies
CREATE POLICY "Users can view their own AI logs" ON ai_commit_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own AI logs" ON ai_commit_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all AI logs" ON ai_commit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Canon Reviews policies
CREATE POLICY "Authors can view reviews of their stories" ON canon_reviews
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM stories WHERE stories.id = canon_reviews.story_id AND stories.author_id = auth.uid())
  );

CREATE POLICY "System can insert reviews" ON canon_reviews
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage reviews" ON canon_reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Functions

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
CREATE OR REPLACE TRIGGER on_auth_user_created
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

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_story_metadata_updated_at BEFORE UPDATE ON story_metadata
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_arcs_updated_at BEFORE UPDATE ON arcs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rules_updated_at BEFORE UPDATE ON rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_periods_updated_at BEFORE UPDATE ON time_periods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed data for initial canon entities

-- Time Periods
INSERT INTO time_periods (name, description, chronological_order) VALUES
  ('The First Age', 'The dawn of creation, when the Weavers first touched the threads of reality.', 1),
  ('The Age of Binding', 'When the great pacts were made between mortals and the cosmic forces.', 2),
  ('The Sundering Era', 'The cataclysmic period when the world was torn asunder.', 3),
  ('The Reconstruction', 'The slow rebuilding of civilization after the Sundering.', 4),
  ('The Modern Age', 'The current era, where old powers stir and new heroes rise.', 5);

-- Arcs
INSERT INTO arcs (name, description, era) VALUES
  ('The Weaver''s Legacy', 'The foundational story of the first Weavers and their binding to the cosmic loom.', 'First Age'),
  ('The Fray Awakens', 'The emergence of the Fray, the chaotic force that threatens to unravel reality.', 'Sundering Era'),
  ('Children of the Binding', 'Stories of those born with the mark of the ancient pacts.', 'Modern Age'),
  ('The Lost Shards', 'The quest to recover fragments of power scattered during the Sundering.', 'Reconstruction'),
  ('Echoes of Verath', 'Tales centered around the ancient city of Verath and its secrets.', 'Various');

-- Locations
INSERT INTO locations (name, region, description) VALUES
  ('Verath', 'The Heartlands', 'An ancient city built upon stones that remember. The seat of Weaver knowledge.'),
  ('The Fray Wastes', 'Eastern Reaches', 'Blighted lands where reality itself is unstable, touched by the Fray.'),
  ('Luminarch Spire', 'Northern Peaks', 'A tower of crystallized light, home to the Order of Luminarchs.'),
  ('The Binding Pools', 'Sacred Groves', 'Natural springs where the veil between worlds is thin.'),
  ('Shadowmere', 'The Underdark', 'A vast underground realm where those who fled the Sundering still dwell.');

-- Characters
INSERT INTO characters (name, description, status) VALUES
  ('Kira of the Threads', 'A young Weaver discovering her connection to the ancient loom.', 'alive'),
  ('The Unbound One', 'A mysterious figure who severed their connection to the cosmic order.', 'unknown'),
  ('Archweaver Theron', 'The last of the original Weavers, now in eternal slumber.', 'dormant'),
  ('Lyssa Brighthollow', 'A scholar dedicated to preserving pre-Sundering knowledge.', 'alive'),
  ('The Fray Herald', 'An entity that speaks for the chaotic force threatening reality.', 'active');

-- Rules
INSERT INTO rules (category, rule_text, severity) VALUES
  ('Magic System', 'Weaving requires connection to the Cosmic Loom. No one can Weave without the Gift or a binding pact.', 'critical'),
  ('Magic System', 'The Fray corrupts Weaving. Prolonged exposure to Fray energy destabilizes a Weaver''s patterns.', 'critical'),
  ('History', 'The Sundering occurred exactly 1,000 years before the Modern Age. This timeline is fixed.', 'critical'),
  ('Geography', 'Verath is always located at the convergence of ley lines, in the center of the Heartlands.', 'standard'),
  ('Metaphysics', 'Death is not final for Weavers; their threads return to the Loom, but memories are lost.', 'critical'),
  ('Tone', 'Everloop is mythic and contemplative, not action-comedy or grimdark.', 'standard'),
  ('Characters', 'Canon characters'' core traits and histories cannot be contradicted without admin approval.', 'critical'),
  ('Magic System', 'Shards are fragments of crystallized reality. They cannot be created, only found or inherited.', 'standard');
