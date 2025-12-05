-- =====================================================
-- EVERLOOP SUPERADMIN + CANON SEED DATA
-- =====================================================
-- Creates Marc Mercury superadmin account and seeds all
-- canonical content from the 4 founding stories.
--
-- To use: Run in Supabase SQL Editor after schema.sql
-- NOTE: The password hash is for "Gold_1234!!" using Supabase's bcrypt
-- =====================================================

-- First, we need to extend the user_role type to include superadmin
DO $$ BEGIN
  ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';
EXCEPTION
  WHEN duplicate_object THEN null;
  WHEN invalid_parameter_value THEN null;
END $$;

-- =====================================================
-- TIME PERIODS (Chronological eras of Everloop)
-- =====================================================
INSERT INTO time_periods (id, name, description, chronological_order) VALUES
  ('11111111-1111-1111-1111-111111111101', 'The First Age', 'The age before the Sundering, when the world was whole and the Weavers walked freely among mortals.', 1),
  ('11111111-1111-1111-1111-111111111102', 'The Age of Binding', 'When the Weavers established their sacred pacts and the Bell Trees first bloomed across the land.', 2),
  ('11111111-1111-1111-1111-111111111103', 'The Sundering Era', 'The cataclysmic breaking of the world, when reality fractured and the Fray was born.', 3),
  ('11111111-1111-1111-1111-111111111104', 'The Reconstruction', 'The painful centuries of rebuilding, when survivors learned to live in a broken world.', 4),
  ('11111111-1111-1111-1111-111111111105', 'The Modern Age', 'The current era, where Shards hold power and the Fray threatens to consume what remains.', 5)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  chronological_order = EXCLUDED.chronological_order;

-- =====================================================
-- STORY ARCS (Major narrative threads)
-- =====================================================
INSERT INTO arcs (id, name, description, era, status) VALUES
  -- From Story 1: The Bell Tree and the Broken World
  ('22222222-2222-2222-2222-222222222201', 'The Bell Tree Prophecy', 'The ancient trees that ring with the sound of fate, marking pivotal moments in the universe.', 'The Sundering Era', 'active'),
  ('22222222-2222-2222-2222-222222222202', 'The Breaking of the World', 'The central cataclysm that shattered reality into fragments, creating the Everloop.', 'The Sundering Era', 'resolved'),
  
  -- From Story 2: The Prince and the Drowning City
  ('22222222-2222-2222-2222-222222222203', 'The Drowning City', 'The tragedy of a great city consumed by the sea, and the prince who tried to save it.', 'The Reconstruction', 'active'),
  ('22222222-2222-2222-2222-222222222204', 'The Veylar Bloodline', 'The cursed royal house whose fate is entwined with water and sacrifice.', 'The Reconstruction', 'active'),
  
  -- From Story 3: The Ballad of Rook and Myx
  ('22222222-2222-2222-2222-222222222205', 'The Ballad of Rook and Myx', 'A legendary tale of two companions whose story echoes through the ages.', 'The Age of Binding', 'resolved'),
  ('22222222-2222-2222-2222-222222222206', 'Songs of Power', 'The tradition of bardic magic that weaves stories into reality itself.', 'The Age of Binding', 'active'),
  
  -- From Story 4: In Service of the Veykar
  ('22222222-2222-2222-2222-222222222207', 'The Veykar Ascension', 'The rise and reign of the mysterious Veykar, beings of immense power.', 'The Modern Age', 'active'),
  ('22222222-2222-2222-2222-222222222208', 'The Servants Path', 'Those who pledge themselves to higher powers in exchange for purpose.', 'The Modern Age', 'active')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  era = EXCLUDED.era,
  status = EXCLUDED.status;

-- =====================================================
-- LOCATIONS (Places in the Everloop universe)
-- =====================================================
INSERT INTO locations (id, name, region, description) VALUES
  -- Core World Locations
  ('33333333-3333-3333-3333-333333333301', 'The Bell Tree Grove', 'The Heartlands', 'A sacred grove where ancient Bell Trees grow, their crystalline leaves chiming warnings of fate.'),
  ('33333333-3333-3333-3333-333333333302', 'The Broken Spire', 'The Shattered Reaches', 'What remains of the Tower of Weaving, now a fractured monument to the old world.'),
  ('33333333-3333-3333-3333-333333333303', 'The Cosmic Loom', 'Beyond the Veil', 'The mythical source of all Weaving power, said to exist between moments.'),
  
  -- From The Drowning City
  ('33333333-3333-3333-3333-333333333304', 'The Drowning City', 'The Sunken Reaches', 'Once a magnificent coastal capital, now submerged beneath dark waters.'),
  ('33333333-3333-3333-3333-333333333305', 'The Tidal Palace', 'The Sunken Reaches', 'The royal seat of the Veylar dynasty, its spires still visible at low tide.'),
  ('33333333-3333-3333-3333-333333333306', 'The Sea Wall', 'The Sunken Reaches', 'The massive barrier that once held back the ocean, now breached and crumbling.'),
  
  -- From Rook and Myx
  ('33333333-3333-3333-3333-333333333307', 'The Wandering Roads', 'The Driftlands', 'Paths that shift and change, connecting places that should not be near.'),
  ('33333333-3333-3333-3333-333333333308', 'The Singing Stones', 'The Harmonic Valleys', 'Ancient standing stones that resonate with bardic power.'),
  ('33333333-3333-3333-3333-333333333309', 'The Last Tavern', 'The Crossroads', 'A legendary inn that appears where travelers need it most.'),
  
  -- From In Service of the Veykar
  ('33333333-3333-3333-3333-333333333310', 'The Veykar Sanctum', 'The High Reaches', 'The fortress-temple where the Veykar hold court over their servants.'),
  ('33333333-3333-3333-3333-333333333311', 'The Proving Grounds', 'The High Reaches', 'Where those who would serve the Veykar are tested.'),
  ('33333333-3333-3333-3333-333333333312', 'The Hollow Market', 'The Frayed Edges', 'A marketplace that exists in the spaces between stable reality.'),
  
  -- Additional Key Locations
  ('33333333-3333-3333-3333-333333333313', 'The Fray', 'Beyond Reality', 'The chaotic non-space where reality has completely unraveled.'),
  ('33333333-3333-3333-3333-333333333314', 'The Archive of Echoes', 'The Heartlands', 'A vast library containing memories of things that no longer exist.'),
  ('33333333-3333-3333-3333-333333333315', 'The Weaver''s Rest', 'The Quiet Lands', 'A sanctuary where Weavers go to die, and their power returns to the Loom.')
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  region = EXCLUDED.region,
  description = EXCLUDED.description;

-- =====================================================
-- CHARACTERS (Canon characters from the stories)
-- =====================================================
INSERT INTO characters (id, name, description, status, traits, is_locked) VALUES
  -- From Story 1: The Bell Tree and the Broken World
  ('44444444-4444-4444-4444-444444444401', 'The First Weaver', 'The legendary founder of Weaving, whose sacrifice caused the Sundering.', 'deceased', ARRAY['ancient', 'powerful', 'tragic'], true),
  ('44444444-4444-4444-4444-444444444402', 'The Keeper of the Grove', 'Guardian of the Bell Tree Grove, eternally listening for warnings.', 'active', ARRAY['wise', 'patient', 'mysterious'], false),
  ('44444444-4444-4444-4444-444444444403', 'The Last Child of the Spire', 'A survivor of the Sundering, carrying memories of the old world.', 'unknown', ARRAY['haunted', 'knowledgeable', 'lonely'], false),
  
  -- From Story 2: The Prince and the Drowning City  
  ('44444444-4444-4444-4444-444444444404', 'Prince Aldren Veylar', 'The last prince of the Drowning City, cursed to watch his kingdom sink.', 'cursed', ARRAY['noble', 'tragic', 'determined'], true),
  ('44444444-4444-4444-4444-444444444405', 'Queen Marenna', 'The Queen who made the pact with the sea, dooming her city to save her son.', 'deceased', ARRAY['regal', 'sacrificing', 'powerful'], true),
  ('44444444-4444-4444-4444-444444444406', 'The Tide Priest', 'Servant of the ocean''s will, who warned of the city''s fate.', 'unknown', ARRAY['prophetic', 'devoted', 'ominous'], false),
  ('44444444-4444-4444-4444-444444444407', 'Coral', 'A child of the depths who befriended the Prince.', 'active', ARRAY['innocent', 'otherworldly', 'kind'], false),
  
  -- From Story 3: The Ballad of Rook and Myx
  ('44444444-4444-4444-4444-444444444408', 'Rook', 'A wandering bard whose songs can reshape small pieces of reality.', 'legendary', ARRAY['charismatic', 'clever', 'musical'], true),
  ('44444444-4444-4444-4444-444444444409', 'Myx', 'Rook''s mysterious companion, part shadow, part memory.', 'legendary', ARRAY['enigmatic', 'loyal', 'dangerous'], true),
  ('44444444-4444-4444-4444-444444444410', 'The Innkeeper', 'Keeper of the Last Tavern, collector of stories.', 'active', ARRAY['welcoming', 'ancient', 'knowing'], false),
  ('44444444-4444-4444-4444-444444444411', 'The Silent King', 'A monarch who lost his voice to pay for a song.', 'cursed', ARRAY['mute', 'powerful', 'regretful'], false),
  
  -- From Story 4: In Service of the Veykar
  ('44444444-4444-4444-4444-444444444412', 'The Veykar', 'Mysterious beings of immense power who accept mortal servants.', 'active', ARRAY['powerful', 'inscrutable', 'demanding'], true),
  ('44444444-4444-4444-4444-444444444413', 'Kael the Sworn', 'A former soldier who pledged service after losing everything.', 'active', ARRAY['disciplined', 'broken', 'devoted'], false),
  ('44444444-4444-4444-4444-444444444414', 'The Hollow Merchant', 'A trader who deals in memories and regrets.', 'active', ARRAY['mercenary', 'calculating', 'amoral'], false),
  ('44444444-4444-4444-4444-444444444415', 'Sister Veyn', 'A healer who serves the Veykar to save others.', 'active', ARRAY['compassionate', 'conflicted', 'skilled'], false),
  
  -- Core Universe Characters
  ('44444444-4444-4444-4444-444444444416', 'The Fray-Touched', 'Those who have been marked by exposure to the Fray.', 'various', ARRAY['unstable', 'powerful', 'doomed'], false),
  ('44444444-4444-4444-4444-444444444417', 'The Chronicler', 'Keeper of the Archive of Echoes, recorder of lost things.', 'active', ARRAY['scholarly', 'obsessive', 'protective'], false)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  status = EXCLUDED.status,
  traits = EXCLUDED.traits,
  is_locked = EXCLUDED.is_locked;

-- =====================================================
-- UNIVERSE RULES (Core laws of the Everloop)
-- =====================================================
INSERT INTO rules (id, category, rule_text, severity) VALUES
  -- Weaving Rules
  ('55555555-5555-5555-5555-555555555501', 'Weaving', 'Weaving requires sacrifice - something must be given to reshape reality.', 'critical'),
  ('55555555-5555-5555-5555-555555555502', 'Weaving', 'The Cosmic Loom cannot be accessed directly by mortals without consequence.', 'critical'),
  ('55555555-5555-5555-5555-555555555503', 'Weaving', 'Weaving against the natural flow of time always creates instability.', 'standard'),
  
  -- The Fray Rules
  ('55555555-5555-5555-5555-555555555504', 'The Fray', 'The Fray is not evil - it is the absence of pattern, pure chaos.', 'critical'),
  ('55555555-5555-5555-5555-555555555505', 'The Fray', 'Those touched by the Fray gain power but lose pieces of their reality.', 'standard'),
  ('55555555-5555-5555-5555-555555555506', 'The Fray', 'The Fray expands when reality is weakened by contradiction or paradox.', 'standard'),
  
  -- Shards Rules
  ('55555555-5555-5555-5555-555555555507', 'Shards', 'Shards are crystallized fragments of the old world''s reality.', 'informational'),
  ('55555555-5555-5555-5555-555555555508', 'Shards', 'Each Shard contains a piece of what was lost in the Sundering.', 'standard'),
  ('55555555-5555-5555-5555-555555555509', 'Shards', 'Combining too many Shards risks creating paradox and attracting the Fray.', 'critical'),
  
  -- History Rules
  ('55555555-5555-5555-5555-555555555510', 'History', 'The Sundering occurred approximately 1,000 years ago.', 'critical'),
  ('55555555-5555-5555-5555-555555555511', 'History', 'Before the Sundering, the world was unified under the Weavers.', 'standard'),
  ('55555555-5555-5555-5555-555555555512', 'History', 'The cause of the Sundering is debated - some say sacrifice, others say hubris.', 'informational'),
  
  -- Character Rules
  ('55555555-5555-5555-5555-555555555513', 'Characters', 'The Veykar do not explain themselves to mortals.', 'standard'),
  ('55555555-5555-5555-5555-555555555514', 'Characters', 'Bell Trees only ring for moments of true significance.', 'standard'),
  ('55555555-5555-5555-5555-555555555515', 'Characters', 'The dead in Everloop do not simply "move on" - their fate is complex.', 'standard'),
  
  -- Tone Rules
  ('55555555-5555-5555-5555-555555555516', 'Tone', 'Everloop stories should feel contemplative and bittersweet.', 'guideline'),
  ('55555555-5555-5555-5555-555555555517', 'Tone', 'Hope exists but is hard-won; despair is easy.', 'guideline'),
  ('55555555-5555-5555-5555-555555555518', 'Tone', 'Magic has weight and consequence - it is never casual.', 'standard')
ON CONFLICT (id) DO UPDATE SET 
  category = EXCLUDED.category,
  rule_text = EXCLUDED.rule_text,
  severity = EXCLUDED.severity;

-- =====================================================
-- LORE ENTRIES (For the glossary/encyclopedia)
-- =====================================================
CREATE TABLE IF NOT EXISTS lore_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL, -- concept, faction, artifact, event, species
  content TEXT NOT NULL,
  related_character_ids UUID[] DEFAULT ARRAY[]::UUID[],
  related_location_ids UUID[] DEFAULT ARRAY[]::UUID[],
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_canon BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE lore_entries ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Anyone can view lore entries" ON lore_entries;
CREATE POLICY "Anyone can view lore entries" ON lore_entries FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can create lore entries" ON lore_entries;
CREATE POLICY "Authenticated users can create lore entries" ON lore_entries 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Creators can update their lore entries" ON lore_entries;
CREATE POLICY "Creators can update their lore entries" ON lore_entries 
  FOR UPDATE USING (created_by = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin'
  ));

-- Seed lore entries
INSERT INTO lore_entries (id, title, category, content, is_canon) VALUES
  ('66666666-6666-6666-6666-666666666601', 'The Sundering', 'event', 'The cataclysmic event that shattered reality approximately 1,000 years ago. When the First Weaver attempted to heal a fundamental flaw in the Cosmic Loom, the backlash tore the world into fragments. Where once there was one unified reality, now there are countless broken pieces, held together by weakening threads of Weaving. The Sundering created the Fray - the chaotic spaces between what remains of reality.', true),
  
  ('66666666-6666-6666-6666-666666666602', 'The Cosmic Loom', 'concept', 'The mythical source of all Weaving power, said to exist in the spaces between moments. The Cosmic Loom is the underlying fabric of reality itself, and Weavers draw upon its threads to reshape the world. After the Sundering, the Loom was damaged, making Weaving more dangerous and unpredictable. Some believe repairing the Loom could restore the world; others fear that any attempt would cause a second Sundering.', true),
  
  ('66666666-6666-6666-6666-666666666603', 'Weavers', 'faction', 'Those with the ability to manipulate the threads of reality. Before the Sundering, Weavers were revered as guardians of the cosmic order. They could reshape matter, heal wounds in reality, and even touch the edges of time. After the Sundering, true Weavers became rare, and their power diminished. Modern Weavers work with fragments and echoes of the old power, always at risk of attracting the Fray.', true),
  
  ('66666666-6666-6666-6666-666666666604', 'The Fray', 'concept', 'The chaotic, ever-expanding space where reality has completely unraveled. The Fray is not evil in the traditional sense - it is simply the absence of pattern, pure entropy given form. It was created by the Sundering and has been slowly consuming the edges of reality ever since. Those who enter the Fray rarely return, and those who do are forever changed - the Fray-Touched.', true),
  
  ('66666666-6666-6666-6666-666666666605', 'Shards', 'artifact', 'Crystallized fragments of the old world''s reality. When the Sundering occurred, pieces of the unified world solidified into Shards - each containing a memory, a power, or a truth from before the breaking. Shards are highly valued and dangerous. They can grant abilities, preserve memories, or even create small pockets of stability. However, collecting too many risks paradox and attracts the attention of the Fray.', true),
  
  ('66666666-6666-6666-6666-666666666606', 'Bell Trees', 'species', 'Ancient trees with crystalline leaves that chime with otherworldly resonance. Bell Trees are living warning systems - they ring only at moments of true cosmic significance. A Bell Tree''s chime might herald a Fray incursion, a pivotal death, or a moment where reality itself hangs in balance. The Bell Tree Grove in the Heartlands contains the oldest and most sensitive of these trees.', true),
  
  ('66666666-6666-6666-6666-666666666607', 'The Veykar', 'faction', 'Mysterious beings of immense power who emerged after the Sundering. Their origins are debated - some believe they are fragments of the First Weaver, others that they are something that slipped through during the breaking. The Veykar do not explain themselves but accept mortal servants who prove worthy. In exchange for service, they offer protection, purpose, and small measures of their vast power.', true),
  
  ('66666666-6666-6666-6666-666666666608', 'Bardic Magic', 'concept', 'A form of Weaving that works through story, song, and performance. Bardic magic is considered safer than direct Weaving because it works with existing patterns rather than forcing new ones. A skilled bard can make a told story become slightly more true, a sung wish slightly more likely. The legendary Rook was said to be able to reshape small pieces of reality through song alone.', true)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  content = EXCLUDED.content;

-- =====================================================
-- NOTE: SUPERADMIN ACCOUNT CREATION
-- =====================================================
-- The superadmin account must be created through Supabase Auth.
-- 
-- STEPS TO CREATE MARC MERCURY SUPERADMIN:
-- 
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > "Create New User"
-- 3. Enter:
--    - Email: Marc.H.Mercury@gmail.com
--    - Password: Gold_1234!!
-- 4. After user is created, copy the user's UUID
-- 5. Run the following SQL with that UUID:
--
-- UPDATE profiles SET 
--   role = 'superadmin',
--   display_name = 'Marc Mercury'
-- WHERE email = 'Marc.H.Mercury@gmail.com';
--
-- OR if you know the UUID:
-- UPDATE profiles SET role = 'superadmin', display_name = 'Marc Mercury' WHERE id = 'YOUR-UUID-HERE';

-- Create a function to promote a user to superadmin
CREATE OR REPLACE FUNCTION promote_to_superadmin(user_email TEXT)
RETURNS void AS $$
BEGIN
  UPDATE profiles SET role = 'superadmin' WHERE email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute to authenticated users (but the function checks internally)
GRANT EXECUTE ON FUNCTION promote_to_superadmin TO authenticated;

-- =====================================================
-- FOUNDING STORIES (Associated with superadmin)
-- =====================================================
-- These will be created after the superadmin account exists.
-- Run this after creating the Marc Mercury user:

-- CREATE OR REPLACE FUNCTION seed_founding_stories()
-- RETURNS void AS $$
-- DECLARE
--   marc_id UUID;
-- BEGIN
--   SELECT id INTO marc_id FROM profiles WHERE email = 'Marc.H.Mercury@gmail.com';
--   
--   IF marc_id IS NOT NULL THEN
--     INSERT INTO stories (id, author_id, title, type, status, content, synopsis, word_count) VALUES
--       ('77777777-7777-7777-7777-777777777701', marc_id, 'The Bell Tree and The Broken World', 'long', 'approved', 
--        '<!-- Content loaded from PDF -->', 
--        'The tale of the Sundering, told through the eyes of those who survived.', 15000),
--       ('77777777-7777-7777-7777-777777777702', marc_id, 'The Prince and the Drowning City', 'long', 'approved',
--        '<!-- Content loaded from PDF -->',
--        'Prince Aldren Veylar watches helplessly as his kingdom sinks beneath the waves.', 12000),
--       ('77777777-7777-7777-7777-777777777703', marc_id, 'The Ballad of Rook and Myx', 'long', 'approved',
--        '<!-- Content loaded from PDF -->',
--        'A wandering bard and their shadow companion traverse the broken world.', 10000),
--       ('77777777-7777-7777-7777-777777777704', marc_id, 'In Service of the Veykar', 'long', 'approved',
--        '<!-- Content loaded from PDF -->',
--        'Those who pledge themselves to mysterious masters find purpose and peril.', 11000)
--     ON CONFLICT (id) DO NOTHING;
--   END IF;
-- END;
-- $$ LANGUAGE plpgsql;

COMMIT;

-- =====================================================
-- SUPERADMIN PERMISSIONS POLICIES
-- =====================================================

-- Allow superadmins to manage all stories
DROP POLICY IF EXISTS "Superadmins can manage all stories" ON stories;
CREATE POLICY "Superadmins can manage all stories" ON stories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Allow superadmins to view all profiles
DROP POLICY IF EXISTS "Superadmins can view all profiles" ON profiles;
CREATE POLICY "Superadmins can view all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

-- Allow superadmins to update any profile
DROP POLICY IF EXISTS "Superadmins can update all profiles" ON profiles;
CREATE POLICY "Superadmins can update all profiles" ON profiles
  FOR UPDATE USING (
    auth.uid() = id OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'superadmin')
  );

SELECT 'Seed data loaded successfully! Remember to create the Marc Mercury user in Supabase Auth.' as message;
