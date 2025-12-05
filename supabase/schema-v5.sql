-- =====================================================
-- EVERLOOP V5 - COMMUNITY LAYER SCHEMA
-- =====================================================
-- Adds reputation system, achievements, world events,
-- creator profiles, and reader mode features.
-- =====================================================

-- =====================================================
-- ENHANCED PROFILES (Add V5 fields)
-- =====================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS lore_title TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_reader_only BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS follower_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS following_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured_contribution_id UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT ARRAY[]::TEXT[];

-- =====================================================
-- USER FOLLOWS (Social graph)
-- =====================================================
CREATE TABLE IF NOT EXISTS user_follows (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  follower_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON user_follows(following_id);

-- =====================================================
-- BADGES & ACHIEVEMENTS
-- =====================================================
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT, -- emoji or icon identifier
  rarity TEXT DEFAULT 'common', -- common, uncommon, rare, epic, legendary
  category TEXT NOT NULL, -- contribution, exploration, social, seasonal, special
  requirement_type TEXT NOT NULL, -- stories_written, characters_created, etc.
  requirement_value INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  is_displayed BOOLEAN DEFAULT true,
  UNIQUE(user_id, badge_id)
);

CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);

-- =====================================================
-- LORE TITLES (Master of...)
-- =====================================================
CREATE TABLE IF NOT EXISTS lore_titles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  category TEXT NOT NULL, -- region, concept, faction, etc.
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER DEFAULT 5,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_titles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title_id UUID REFERENCES lore_titles(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT false, -- only one can be active
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, title_id)
);

-- =====================================================
-- WORLD EVENTS (Seasonal/Monthly challenges)
-- =====================================================
CREATE TABLE IF NOT EXISTS world_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  event_type TEXT NOT NULL, -- seasonal, monthly, special
  theme TEXT NOT NULL, -- The Fray Expands, New Houses, etc.
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT false,
  reward_badge_id UUID REFERENCES badges(id),
  reward_title_id UUID REFERENCES lore_titles(id),
  reward_reputation INTEGER DEFAULT 100,
  requirements JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS event_submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID REFERENCES world_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  submission_type TEXT NOT NULL, -- story, character, location, quest, etc.
  reference_id UUID, -- ID of the submitted content
  submission_note TEXT,
  status TEXT DEFAULT 'pending', -- pending, approved, featured, rejected
  votes INTEGER DEFAULT 0,
  is_winner BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS event_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  submission_id UUID REFERENCES event_submissions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT DEFAULT 'up', -- up, down
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(submission_id, user_id)
);

-- =====================================================
-- READER MODE - COLLECTIONS & BOOKMARKS
-- =====================================================
CREATE TABLE IF NOT EXISTS reading_lists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  story_ids UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content_type TEXT NOT NULL, -- story, character, location, lore_entry
  content_id UUID NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_type, content_id)
);

-- =====================================================
-- LORE FRAGMENTS (Collectibles for readers)
-- =====================================================
CREATE TABLE IF NOT EXISTS lore_fragments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  fragment_type TEXT NOT NULL, -- quote, secret, hint, memory
  rarity TEXT DEFAULT 'common', -- common, uncommon, rare, legendary
  source_story_id UUID REFERENCES stories(id),
  source_character_id UUID REFERENCES characters(id),
  unlock_condition TEXT, -- how to unlock this fragment
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_fragments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  fragment_id UUID REFERENCES lore_fragments(id) ON DELETE CASCADE NOT NULL,
  discovered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, fragment_id)
);

-- =====================================================
-- CONTRIBUTION TRACKING (for profiles)
-- =====================================================
CREATE TABLE IF NOT EXISTS contribution_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  stories_written INTEGER DEFAULT 0,
  stories_approved INTEGER DEFAULT 0,
  characters_created INTEGER DEFAULT 0,
  locations_created INTEGER DEFAULT 0,
  lore_entries_created INTEGER DEFAULT 0,
  quests_created INTEGER DEFAULT 0,
  maps_created INTEGER DEFAULT 0,
  total_word_count INTEGER DEFAULT 0,
  events_participated INTEGER DEFAULT 0,
  events_won INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- SEED INITIAL BADGES
-- =====================================================
INSERT INTO badges (id, name, description, icon, rarity, category, requirement_type, requirement_value) VALUES
  -- Contribution Badges
  ('b0000001-0001-0001-0001-000000000001', 'First Word', 'Published your first story', '✍️', 'common', 'contribution', 'stories_approved', 1),
  ('b0000001-0001-0001-0001-000000000002', 'Storyteller', 'Published 5 approved stories', '📖', 'uncommon', 'contribution', 'stories_approved', 5),
  ('b0000001-0001-0001-0001-000000000003', 'Chronicler', 'Published 25 approved stories', '📚', 'rare', 'contribution', 'stories_approved', 25),
  ('b0000001-0001-0001-0001-000000000004', 'Lore Master', 'Published 100 approved stories', '🏛️', 'legendary', 'contribution', 'stories_approved', 100),
  
  ('b0000001-0001-0001-0001-000000000005', 'Character Creator', 'Created your first character', '👤', 'common', 'contribution', 'characters_created', 1),
  ('b0000001-0001-0001-0001-000000000006', 'People Person', 'Created 10 characters', '👥', 'uncommon', 'contribution', 'characters_created', 10),
  ('b0000001-0001-0001-0001-000000000007', 'Portraitist', 'Created 50 characters', '🎭', 'rare', 'contribution', 'characters_created', 50),
  
  ('b0000001-0001-0001-0001-000000000008', 'Cartographer', 'Created your first location', '📍', 'common', 'contribution', 'locations_created', 1),
  ('b0000001-0001-0001-0001-000000000009', 'World Builder', 'Created 25 locations', '🗺️', 'rare', 'contribution', 'locations_created', 25),
  
  ('b0000001-0001-0001-0001-000000000010', 'Word Weaver', 'Wrote 10,000 words total', '🧵', 'common', 'contribution', 'word_count', 10000),
  ('b0000001-0001-0001-0001-000000000011', 'Ink Spiller', 'Wrote 50,000 words total', '🖋️', 'uncommon', 'contribution', 'word_count', 50000),
  ('b0000001-0001-0001-0001-000000000012', 'Novelist', 'Wrote 100,000 words total', '📝', 'rare', 'contribution', 'word_count', 100000),
  
  -- Social Badges
  ('b0000001-0001-0001-0001-000000000013', 'Friendly Face', 'Gained 10 followers', '😊', 'common', 'social', 'followers', 10),
  ('b0000001-0001-0001-0001-000000000014', 'Influencer', 'Gained 100 followers', '⭐', 'uncommon', 'social', 'followers', 100),
  ('b0000001-0001-0001-0001-000000000015', 'Legend', 'Gained 1,000 followers', '👑', 'legendary', 'social', 'followers', 1000),
  
  -- Exploration Badges (for readers)
  ('b0000001-0001-0001-0001-000000000016', 'Curious Reader', 'Bookmarked 10 items', '🔖', 'common', 'exploration', 'bookmarks', 10),
  ('b0000001-0001-0001-0001-000000000017', 'Fragment Finder', 'Discovered 25 lore fragments', '🔍', 'uncommon', 'exploration', 'fragments', 25),
  ('b0000001-0001-0001-0001-000000000018', 'Scholar', 'Discovered 100 lore fragments', '🎓', 'rare', 'exploration', 'fragments', 100),
  
  -- Event Badges
  ('b0000001-0001-0001-0001-000000000019', 'Event Participant', 'Submitted to your first event', '🎪', 'common', 'seasonal', 'events_participated', 1),
  ('b0000001-0001-0001-0001-000000000020', 'Event Champion', 'Won an event', '🏆', 'epic', 'seasonal', 'events_won', 1)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED LORE TITLES
-- =====================================================
INSERT INTO lore_titles (id, title, description, category, requirement_type, requirement_value, icon) VALUES
  ('t0000001-0001-0001-0001-000000000001', 'Master of the Heartlands', 'Expert in stories set in the Heartlands', 'region', 'heartlands_stories', 5, '🏔️'),
  ('t0000001-0001-0001-0001-000000000002', 'Weaver of Drift-Lines', 'Expert in stories involving the Driftlands', 'region', 'driftlands_stories', 5, '🌀'),
  ('t0000001-0001-0001-0001-000000000003', 'Voice of the Sunken', 'Expert in stories of the Sunken Reaches', 'region', 'sunken_stories', 5, '🌊'),
  ('t0000001-0001-0001-0001-000000000004', 'Fray Walker', 'Expert in stories touching the Fray', 'concept', 'fray_stories', 5, '⚡'),
  ('t0000001-0001-0001-0001-000000000005', 'Shard Bearer', 'Expert in stories involving Shards', 'concept', 'shard_stories', 5, '💎'),
  ('t0000001-0001-0001-0001-000000000006', 'Bell Listener', 'Expert in stories featuring Bell Trees', 'concept', 'belltree_stories', 5, '🔔'),
  ('t0000001-0001-0001-0001-000000000007', 'Keeper of Memories', 'Created 25+ characters', 'contribution', 'characters_created', 25, '👁️'),
  ('t0000001-0001-0001-0001-000000000008', 'Architect of Worlds', 'Created 25+ locations', 'contribution', 'locations_created', 25, '🏛️'),
  ('t0000001-0001-0001-0001-000000000009', 'Veykar Servant', 'Expert in Veykar-related stories', 'faction', 'veykar_stories', 5, '🌙'),
  ('t0000001-0001-0001-0001-000000000010', 'Song Weaver', 'Expert in bardic tradition stories', 'concept', 'bardic_stories', 5, '🎵')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED SAMPLE WORLD EVENT
-- =====================================================
INSERT INTO world_events (id, name, description, long_description, event_type, theme, starts_at, ends_at, is_active, reward_reputation) VALUES
  ('e0000001-0001-0001-0001-000000000001', 
   'The Fray Expands', 
   'Write a story involving temporal or reality instability.',
   'The edges of reality grow thin. Something stirs in the spaces between. This month, we celebrate stories that explore the Fray - the chaotic non-space that threatens to consume what remains of the world. Your story should feature:\n\n• Reality instability or paradox\n• Characters touched by the Fray\n• The consequences of tampering with the fabric of existence\n\nWinning submissions will be featured in the Canon Highlights and their creators will receive the "Fray Walker" title.',
   'monthly',
   'fray',
   NOW(),
   NOW() + INTERVAL '30 days',
   true,
   500)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE world_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE reading_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_fragments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_fragments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_stats ENABLE ROW LEVEL SECURITY;

-- Basic policies
CREATE POLICY "Anyone can view badges" ON badges FOR SELECT USING (true);
CREATE POLICY "Anyone can view lore titles" ON lore_titles FOR SELECT USING (true);
CREATE POLICY "Anyone can view active events" ON world_events FOR SELECT USING (true);
CREATE POLICY "Anyone can view lore fragments" ON lore_fragments FOR SELECT USING (true);

CREATE POLICY "Users can view their own badges" ON user_badges FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view their own titles" ON user_titles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view their own fragments" ON user_fragments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view their own bookmarks" ON bookmarks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can view their own stats" ON contribution_stats FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage their follows" ON user_follows FOR ALL USING (follower_id = auth.uid());
CREATE POLICY "Users can manage their bookmarks" ON bookmarks FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage their reading lists" ON reading_lists FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can view public reading lists" ON reading_lists FOR SELECT USING (is_public = true);

CREATE POLICY "Users can submit to events" ON event_submissions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view event submissions" ON event_submissions FOR SELECT USING (true);
CREATE POLICY "Users can vote on submissions" ON event_votes FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- FUNCTIONS FOR REPUTATION
-- =====================================================
CREATE OR REPLACE FUNCTION update_reputation(p_user_id UUID, p_amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE profiles 
  SET reputation_score = COALESCE(reputation_score, 0) + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_contribution_stats(p_user_id UUID, p_field TEXT, p_increment INTEGER DEFAULT 1)
RETURNS void AS $$
BEGIN
  INSERT INTO contribution_stats (user_id) 
  VALUES (p_user_id) 
  ON CONFLICT (user_id) DO NOTHING;
  
  EXECUTE format('UPDATE contribution_stats SET %I = COALESCE(%I, 0) + $1, updated_at = NOW() WHERE user_id = $2', p_field, p_field)
  USING p_increment, p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update follower counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET follower_count = COALESCE(follower_count, 0) + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = COALESCE(following_count, 0) + 1 WHERE id = NEW.follower_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET follower_count = GREATEST(COALESCE(follower_count, 0) - 1, 0) WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = GREATEST(COALESCE(following_count, 0) - 1, 0) WHERE id = OLD.follower_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_follow_change ON user_follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON user_follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

SELECT 'V5 Community Layer schema installed successfully!' as message;
