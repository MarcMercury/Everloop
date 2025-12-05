-- Everloop V2 Schema Additions
-- Run this AFTER schema.sql and seed.sql

-- ============================================
-- MAP LAB TABLES
-- ============================================

-- Maps (user-created world maps)
CREATE TABLE IF NOT EXISTS maps (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  canvas_data JSONB DEFAULT '{}'::jsonb,
  thumbnail_url TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public_canon', 'branch_canon', 'private')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Map Elements (draggable items on maps)
CREATE TABLE IF NOT EXISTS map_elements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  map_id UUID REFERENCES maps(id) ON DELETE CASCADE NOT NULL,
  element_type TEXT NOT NULL CHECK (element_type IN (
    'mountain', 'river', 'bell_tree', 'hollow', 'drift_line', 'fray_zone',
    'settlement', 'shard_site', 'ruin', 'folded_structure', 'custom'
  )),
  name TEXT,
  description TEXT,
  x_position FLOAT NOT NULL,
  y_position FLOAT NOT NULL,
  scale FLOAT DEFAULT 1.0,
  rotation FLOAT DEFAULT 0,
  properties JSONB DEFAULT '{}'::jsonb,
  linked_location_id UUID REFERENCES locations(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Story Paths (connections between map locations)
CREATE TABLE IF NOT EXISTS story_paths (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  map_id UUID REFERENCES maps(id) ON DELETE CASCADE NOT NULL,
  from_element_id UUID REFERENCES map_elements(id) ON DELETE CASCADE NOT NULL,
  to_element_id UUID REFERENCES map_elements(id) ON DELETE CASCADE NOT NULL,
  path_type TEXT DEFAULT 'journey' CHECK (path_type IN ('journey', 'trade_route', 'drift_passage', 'fray_corridor', 'ley_line')),
  story_id UUID REFERENCES stories(id),
  description TEXT,
  waypoints JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QUEST BUILDER TABLES
-- ============================================

-- Quests (interactive branching narratives)
CREATE TABLE IF NOT EXISTS quests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT DEFAULT 'lore' CHECK (quest_type IN ('lore', 'mystery', 'puzzle', 'combat', 'exploration', 'drift_sequence')),
  difficulty TEXT DEFAULT 'normal' CHECK (difficulty IN ('easy', 'normal', 'hard', 'legendary')),
  estimated_time INTEGER, -- in minutes
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public_canon', 'branch_canon', 'private')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected')),
  linked_story_id UUID REFERENCES stories(id),
  linked_location_id UUID REFERENCES locations(id),
  start_node_id UUID, -- will be set after nodes are created
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quest Nodes (individual steps in a quest)
CREATE TABLE IF NOT EXISTS quest_nodes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  node_type TEXT NOT NULL CHECK (node_type IN ('start', 'narrative', 'choice', 'puzzle', 'combat', 'reward', 'ending')),
  title TEXT NOT NULL,
  content TEXT, -- narrative text or puzzle description
  x_position FLOAT DEFAULT 0,
  y_position FLOAT DEFAULT 0,
  properties JSONB DEFAULT '{}'::jsonb, -- node-specific data (puzzle solution, combat stats, rewards)
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quest Choices (connections between nodes)
CREATE TABLE IF NOT EXISTS quest_choices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_node_id UUID REFERENCES quest_nodes(id) ON DELETE CASCADE NOT NULL,
  to_node_id UUID REFERENCES quest_nodes(id) ON DELETE CASCADE NOT NULL,
  choice_text TEXT NOT NULL,
  requirements JSONB DEFAULT '{}'::jsonb, -- conditions to show this choice
  consequences JSONB DEFAULT '{}'::jsonb, -- effects of choosing this
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quest NPCs (characters in quests)
CREATE TABLE IF NOT EXISTS quest_npcs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  role TEXT, -- e.g., 'quest_giver', 'antagonist', 'ally', 'neutral'
  dialogue JSONB DEFAULT '{}'::jsonb,
  linked_character_id UUID REFERENCES characters(id),
  portrait_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOREFORGE TABLES
-- ============================================

-- Lore Entry Types
DO $$ BEGIN
  CREATE TYPE lore_entry_type AS ENUM (
    'character', 'location', 'creature', 'shard', 'faction', 
    'artifact', 'mythology', 'event', 'species', 'house', 'religion', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Lore Entries (unified encyclopedia entries)
CREATE TABLE IF NOT EXISTS lore_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  entry_type lore_entry_type NOT NULL,
  name TEXT NOT NULL,
  summary TEXT, -- short description
  content TEXT, -- full detailed content
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  ai_tags TEXT[] DEFAULT ARRAY[]::TEXT[], -- AI-generated tags like 'Folded Character', 'Weaving-compatible'
  images JSONB DEFAULT '[]'::jsonb, -- array of image URLs with captions
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public_canon', 'branch_canon', 'private')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected')),
  properties JSONB DEFAULT '{}'::jsonb, -- type-specific properties
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lore References (connections between entries and stories)
CREATE TABLE IF NOT EXISTS lore_references (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lore_entry_id UUID REFERENCES lore_entries(id) ON DELETE CASCADE NOT NULL,
  reference_type TEXT NOT NULL CHECK (reference_type IN ('story', 'quest', 'map', 'lore_entry')),
  reference_id UUID NOT NULL,
  context TEXT, -- how it's referenced
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lore Timeline (for tracking when entries appear in universe history)
CREATE TABLE IF NOT EXISTS lore_timeline (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lore_entry_id UUID REFERENCES lore_entries(id) ON DELETE CASCADE NOT NULL,
  time_period_id UUID REFERENCES time_periods(id),
  event_date TEXT, -- flexible date format for in-universe dates
  event_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BESTIARY / CREATURES TABLE
-- ============================================

-- Creatures (dedicated creature/species entries)
CREATE TABLE IF NOT EXISTS creatures (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  species_name TEXT, -- if this is a species, the species name
  is_species BOOLEAN DEFAULT FALSE, -- true if this is a species template
  parent_species_id UUID REFERENCES creatures(id), -- if this creature belongs to a species
  description TEXT,
  habitat TEXT,
  behavior TEXT,
  fray_behavior TEXT, -- how it behaves in the Fray
  threat_level TEXT CHECK (threat_level IN ('harmless', 'low', 'moderate', 'high', 'extreme', 'legendary')),
  abilities JSONB DEFAULT '[]'::jsonb,
  weaknesses JSONB DEFAULT '[]'::jsonb,
  image_url TEXT,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public_canon', 'branch_canon', 'private')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHARACTER DESIGNER ENHANCEMENTS
-- ============================================

-- Character Details (extended character information)
CREATE TABLE IF NOT EXISTS character_details (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE UNIQUE NOT NULL,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  origin TEXT,
  path_role TEXT CHECK (path_role IN ('dreamer', 'lantern', 'weaver', 'folded', 'unbound', 'herald', 'keeper', 'wanderer', 'other')),
  shard_alignment JSONB DEFAULT '[]'::jsonb, -- array of shard affinities
  emotional_arc TEXT,
  physical_description TEXT,
  fray_behavior TEXT, -- how they behave in the Fray
  abilities JSONB DEFAULT '[]'::jsonb,
  relationships JSONB DEFAULT '[]'::jsonb,
  portrait_url TEXT,
  gallery JSONB DEFAULT '[]'::jsonb,
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('public_canon', 'branch_canon', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WHAT IF GENERATOR
-- ============================================

-- What If Scenarios (saved AI-generated scenarios)
CREATE TABLE IF NOT EXISTS what_if_scenarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  creator_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  prompt TEXT NOT NULL, -- the "what if" question
  generated_content TEXT NOT NULL, -- AI-generated response
  context_type TEXT CHECK (context_type IN ('story', 'location', 'character', 'quest', 'general')),
  context_id UUID, -- ID of the related entity
  is_adopted BOOLEAN DEFAULT FALSE, -- if user incorporated this into their work
  adopted_to_story_id UUID REFERENCES stories(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_maps_creator ON maps(creator_id);
CREATE INDEX IF NOT EXISTS idx_maps_visibility ON maps(visibility);
CREATE INDEX IF NOT EXISTS idx_map_elements_map ON map_elements(map_id);
CREATE INDEX IF NOT EXISTS idx_story_paths_map ON story_paths(map_id);
CREATE INDEX IF NOT EXISTS idx_quests_creator ON quests(creator_id);
CREATE INDEX IF NOT EXISTS idx_quest_nodes_quest ON quest_nodes(quest_id);
CREATE INDEX IF NOT EXISTS idx_quest_choices_from ON quest_choices(from_node_id);
CREATE INDEX IF NOT EXISTS idx_lore_entries_creator ON lore_entries(creator_id);
CREATE INDEX IF NOT EXISTS idx_lore_entries_type ON lore_entries(entry_type);
CREATE INDEX IF NOT EXISTS idx_lore_references_entry ON lore_references(lore_entry_id);
CREATE INDEX IF NOT EXISTS idx_creatures_creator ON creatures(creator_id);
CREATE INDEX IF NOT EXISTS idx_character_details_character ON character_details(character_id);
CREATE INDEX IF NOT EXISTS idx_what_if_creator ON what_if_scenarios(creator_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE map_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_npcs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE lore_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE creatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE what_if_scenarios ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES
-- ============================================

-- Maps policies
CREATE POLICY "Users can view public maps or their own" ON maps
  FOR SELECT USING (visibility != 'private' OR creator_id = auth.uid());
CREATE POLICY "Users can create their own maps" ON maps
  FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Users can update their own maps" ON maps
  FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Users can delete their own maps" ON maps
  FOR DELETE USING (creator_id = auth.uid());

-- Map elements follow map permissions
CREATE POLICY "Map elements follow map permissions" ON map_elements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM maps WHERE maps.id = map_elements.map_id AND (maps.creator_id = auth.uid() OR maps.visibility != 'private'))
  );

-- Story paths follow map permissions
CREATE POLICY "Story paths follow map permissions" ON story_paths
  FOR ALL USING (
    EXISTS (SELECT 1 FROM maps WHERE maps.id = story_paths.map_id AND (maps.creator_id = auth.uid() OR maps.visibility != 'private'))
  );

-- Quests policies
CREATE POLICY "Users can view public quests or their own" ON quests
  FOR SELECT USING (visibility != 'private' OR creator_id = auth.uid());
CREATE POLICY "Users can create their own quests" ON quests
  FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Users can update their own quests" ON quests
  FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Users can delete their own quests" ON quests
  FOR DELETE USING (creator_id = auth.uid());

-- Quest nodes follow quest permissions
CREATE POLICY "Quest nodes follow quest permissions" ON quest_nodes
  FOR ALL USING (
    EXISTS (SELECT 1 FROM quests WHERE quests.id = quest_nodes.quest_id AND (quests.creator_id = auth.uid() OR quests.visibility != 'private'))
  );

-- Quest choices follow quest permissions
CREATE POLICY "Quest choices follow quest permissions" ON quest_choices
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM quest_nodes 
      JOIN quests ON quests.id = quest_nodes.quest_id 
      WHERE quest_nodes.id = quest_choices.from_node_id 
      AND (quests.creator_id = auth.uid() OR quests.visibility != 'private')
    )
  );

-- Quest NPCs follow quest permissions
CREATE POLICY "Quest NPCs follow quest permissions" ON quest_npcs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM quests WHERE quests.id = quest_npcs.quest_id AND (quests.creator_id = auth.uid() OR quests.visibility != 'private'))
  );

-- Lore entries policies
CREATE POLICY "Users can view public lore or their own" ON lore_entries
  FOR SELECT USING (visibility != 'private' OR creator_id = auth.uid());
CREATE POLICY "Users can create their own lore entries" ON lore_entries
  FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Users can update their own lore entries" ON lore_entries
  FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Users can delete their own lore entries" ON lore_entries
  FOR DELETE USING (creator_id = auth.uid());

-- Lore references - anyone can view
CREATE POLICY "Anyone can view lore references" ON lore_references FOR SELECT USING (true);
CREATE POLICY "Users can manage their lore references" ON lore_references FOR ALL USING (
  EXISTS (SELECT 1 FROM lore_entries WHERE lore_entries.id = lore_references.lore_entry_id AND lore_entries.creator_id = auth.uid())
);

-- Lore timeline - anyone can view
CREATE POLICY "Anyone can view lore timeline" ON lore_timeline FOR SELECT USING (true);
CREATE POLICY "Users can manage their lore timeline" ON lore_timeline FOR ALL USING (
  EXISTS (SELECT 1 FROM lore_entries WHERE lore_entries.id = lore_timeline.lore_entry_id AND lore_entries.creator_id = auth.uid())
);

-- Creatures policies
CREATE POLICY "Users can view public creatures or their own" ON creatures
  FOR SELECT USING (visibility != 'private' OR creator_id = auth.uid());
CREATE POLICY "Users can create their own creatures" ON creatures
  FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Users can update their own creatures" ON creatures
  FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Users can delete their own creatures" ON creatures
  FOR DELETE USING (creator_id = auth.uid());

-- Character details policies
CREATE POLICY "Users can view public character details" ON character_details
  FOR SELECT USING (visibility != 'private' OR creator_id = auth.uid());
CREATE POLICY "Users can create character details" ON character_details
  FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Users can update their character details" ON character_details
  FOR UPDATE USING (creator_id = auth.uid());

-- What If scenarios - private to creator
CREATE POLICY "Users can view their own scenarios" ON what_if_scenarios
  FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "Users can create scenarios" ON what_if_scenarios
  FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Users can update their scenarios" ON what_if_scenarios
  FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Users can delete their scenarios" ON what_if_scenarios
  FOR DELETE USING (creator_id = auth.uid());

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS update_maps_updated_at ON maps;
CREATE TRIGGER update_maps_updated_at BEFORE UPDATE ON maps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_quests_updated_at ON quests;
CREATE TRIGGER update_quests_updated_at BEFORE UPDATE ON quests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_lore_entries_updated_at ON lore_entries;
CREATE TRIGGER update_lore_entries_updated_at BEFORE UPDATE ON lore_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_creatures_updated_at ON creatures;
CREATE TRIGGER update_creatures_updated_at BEFORE UPDATE ON creatures
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_character_details_updated_at ON character_details;
CREATE TRIGGER update_character_details_updated_at BEFORE UPDATE ON character_details
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
