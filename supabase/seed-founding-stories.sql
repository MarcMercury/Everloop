-- EVERLOOP FOUNDING STORIES IMPORT
-- This file imports the 4 founding stories by Marc Mercury into the database
-- Run this AFTER COMPLETE_SETUP.sql

-- ============================================
-- ENSURE UUID EXTENSION IS ENABLED
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- STORY 1: THE BELL TREE AND THE BROKEN WORLD
-- ============================================

-- Story 1 Record
INSERT INTO stories (id, title, synopsis, content, word_count, status, is_canon, created_at) VALUES (
  'a0000001-0001-0001-0001-000000000001',
  'The Bell Tree and The Broken World',
  'Three siblings—Kaerlin (Kerr), Mira, and Thomel (Thom)—discover their world is unraveling when a mysterious Bell Tree appears. With guidance from Eidon, a hermit who can "fold" through reality, they embark on a journey to find the Second Shard and begin to understand the Pattern that holds the Everloop together.',
  '{"type": "founding_story", "chapters": 12, "summary": "The siblings discover the Bell Tree, learn about the Fray and Shards from the hermit Eidon, and ultimately find the Second Shard in an underground cavern beneath Drelmere. Eidon sacrifices himself by unfolding to help them enter the sacred chamber."}',
  15000,
  'approved',
  TRUE,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Story 1 Characters
INSERT INTO characters (id, name, title, description, role, status, backstory, personality_traits, is_canon) VALUES
('c0000001-0001-0001-0001-000000000001', 'Kaerlin (Kerr)', 'The First Witness', 'The oldest of three siblings who discovers the Bell Tree. Natural leader who takes responsibility for protecting his younger siblings.', 'protagonist', 'active', 'Raised by Uncle Edran after unknown circumstances. Learned practical skills and developed a protective nature.', ARRAY['protective', 'responsible', 'curious', 'determined'], TRUE),
('c0000001-0001-0001-0001-000000000002', 'Mira', 'The Questioner', 'Middle sibling with quick wit and perceptive nature. Often asks the questions others are afraid to voice.', 'protagonist', 'active', 'Grew up with her brothers under Uncle Edran''s care. Has always been observant and intuitive.', ARRAY['perceptive', 'witty', 'brave', 'intuitive'], TRUE),
('c0000001-0001-0001-0001-000000000003', 'Thomel (Thom)', 'The Youngest Seeker', 'Youngest sibling who holds onto hope and wonder despite the darkness around them.', 'protagonist', 'active', 'The baby of the family, protected by his older siblings but possessing his own inner strength.', ARRAY['hopeful', 'innocent', 'resilient', 'wondering'], TRUE),
('c0000001-0001-0001-0001-000000000004', 'Eidon', 'The Folder', 'A hermit who lives on Watcher''s Hill and possesses the rare ability to "fold" through space and reality. Keeper of ancient knowledge about the Shards and Pattern.', 'mentor', 'deceased', 'Once part of a larger group who understood the Pattern. Retreated to solitude when the Fray began spreading. Sacrificed himself by unfolding to help the siblings enter the sacred chamber.', ARRAY['wise', 'mysterious', 'sacrificial', 'knowledgeable'], TRUE),
('c0000001-0001-0001-0001-000000000005', 'Uncle Edran', 'The Guardian', 'Raised the three siblings. A practical man who prepared them for independence.', 'supporting', 'active', 'Took in the three children and raised them with practical skills and values.', ARRAY['practical', 'caring', 'humble', 'steady'], TRUE),
('c0000001-0001-0001-0001-000000000006', 'Mayor Halrick Vann', 'Mayor of Drelmere', 'The mayor of Drelmere who witnesses the Bell Tree''s arrival in the town square.', 'supporting', 'active', 'A local leader trying to maintain order as strange events unfold.', ARRAY['authoritative', 'concerned', 'civic-minded'], TRUE),
('c0000001-0001-0001-0001-000000000007', 'Merra Dune', 'The Apothecary', 'An apothecary in Drelmere who helps the siblings and knows local remedies.', 'ally', 'active', 'A healer and herbalist who serves the community of Drelmere.', ARRAY['helpful', 'knowledgeable', 'practical'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- Story 1 Locations
INSERT INTO locations (id, name, description, region, terrain_type, significance, notable_features, is_canon) VALUES
('10000001-0001-0001-0001-000000000001', 'Drelmere', 'A small town that becomes the site of the Bell Tree''s appearance. Features a town square where the mysterious tree materializes.', 'Central Realm', 'settlement', 'First location where a Bell Tree manifested in recent memory. Site of the Second Shard discovery.', ARRAY['Town Square', 'The Gorge', 'Underground Cavern'], TRUE),
('10000001-0001-0001-0001-000000000002', 'Watcher''s Hill', 'A lonely hill where the hermit Eidon lives, overlooking the surrounding lands. He watches for signs of the Fray from this vantage point.', 'Near Drelmere', 'hill', 'Home of Eidon the Folder, a place of observation and ancient knowledge.', ARRAY['Eidon''s Dwelling', 'Observation Point'], TRUE),
('10000001-0001-0001-0001-000000000003', 'Uncle Edran''s Home', 'The humble dwelling where the three siblings were raised by their Uncle Edran before setting out on their journey.', 'Rural Outskirts', 'homestead', 'Starting point of the siblings'' journey.', ARRAY['Family Home', 'Workshop'], TRUE),
('10000001-0001-0001-0001-000000000004', 'The Sacred Cavern', 'An underground chamber beneath Drelmere containing 22 spirals and bells that must be rung in sequence to reveal the Second Shard.', 'Beneath Drelmere', 'underground', 'Location of the Second Shard. Accessible only through a riddle entrance.', ARRAY['22 Spirals', 'Bell Sequence Puzzle', 'Shard Chamber'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- Story 1 Lore
INSERT INTO lore_entries (id, title, content, category, tags, is_canon) VALUES
('e0000001-0001-0001-0001-000000000001', 'The Bell Trees', 'Mysterious trees that appear suddenly in locations of significance. They ring without wind and mark the awakening of Shards. When they appear, great change is imminent. The Bell Tree in Story 1 appeared first at Uncle Edran''s property, then in Drelmere''s town square.', 'phenomena', ARRAY['Bell Tree', 'Shards', 'Warning', 'Pattern'], TRUE),
('e0000001-0001-0001-0001-000000000002', 'Folding', 'A rare ability to move through space and reality in unconventional ways. Eidon demonstrated this power but warned of its cost—unfolding too far can be fatal. He ultimately sacrificed himself by unfolding completely to open the path to the Shard chamber.', 'abilities', ARRAY['Folding', 'Reality', 'Travel', 'Sacrifice'], TRUE),
('e0000001-0001-0001-0001-000000000003', 'The Thirteen Shards', 'There are 13 Shards in total—remnants of the original Pattern that held reality together. The First Architects placed them as safeguards. Each Shard is a stillpoint in a world that can no longer stand still. The siblings discovered the Second Shard in Story 1.', 'cosmology', ARRAY['Shards', 'Pattern', 'First Architects', 'Safeguards'], TRUE),
('e0000001-0001-0001-0001-000000000004', 'Weavers and Dreamers', 'Ancient beings or roles mentioned by Eidon. Weavers work with the Pattern directly, while Dreamers may be those who shaped reality through vision. The exact nature and current status of these beings remains mysterious.', 'beings', ARRAY['Weavers', 'Dreamers', 'Pattern', 'Ancient'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORY 2: THE PRINCE AND THE DROWNING CITY
-- ============================================

-- Story 2 Record
INSERT INTO stories (id, title, synopsis, content, word_count, status, is_canon, created_at) VALUES (
  'a0000001-0001-0001-0001-000000000002',
  'The Prince and the Drowning City',
  'Prince Auren Thorne of House Thorne escapes his protective parents to save the coastal town of Virelay, which is being consumed by the Fray. Despite being an exceptionally poor fighter, his courage and compassion lead him to dive into the corrupted sea and discover a Shard hidden in an underwater chamber.',
  '{"type": "founding_story", "chapters": 7, "summary": "Auren sneaks away from home to help Virelay, a town where reality shifts constantly—buildings appear and disappear, people are forgotten. He discovers the source is underwater, dives through a violent storm to reach a stone well on the seafloor, enters an impossible room with a hearth, and claims the Shard as the tower collapses around him."}',
  5900,
  'approved',
  TRUE,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Story 2 Characters
INSERT INTO characters (id, name, title, description, role, status, backstory, personality_traits, is_canon) VALUES
('c0000001-0001-0001-0002-000000000001', 'Auren Thorne', 'The Lord of Luck', 'Prince of House Thorne, exceptionally bad at fighting but gifted with courage, compassion, and an unshakeable belief in doing what''s right. Stumbles through combat but somehow emerges victorious through sheer luck and determination.', 'protagonist', 'active', 'Raised in privilege by loving parents who tried to protect him from danger. Studies lore, maps, and myths extensively. Despite his incompetence in battle, his heart for the people drives him to action.', ARRAY['courageous', 'compassionate', 'clumsy', 'determined', 'scholarly', 'optimistic'], TRUE),
('c0000001-0001-0001-0002-000000000002', 'Lord Eldren Thorne', 'Lord of House Thorne', 'Auren''s father, who loves both his people and his son deeply but fears for Auren''s safety.', 'supporting', 'active', 'Leader of House Thorne, trying to balance duty to his people with protecting his only son.', ARRAY['loving', 'protective', 'wise', 'conflicted'], TRUE),
('c0000001-0001-0001-0002-000000000003', 'Lady Alira Thorne', 'Lady of House Thorne', 'Auren''s mother, who shares her husband''s concern for their son but recognizes the goodness in his heart.', 'supporting', 'active', 'Noblewoman who has raised Auren with love while hoping to keep him safe from the world''s dangers.', ARRAY['loving', 'perceptive', 'concerned', 'hopeful'], TRUE),
('c0000001-0001-0001-0002-000000000004', 'The Master-at-Arms', 'Trainer of House Thorne', 'A scarred, stocky veteran who trains Auren in combat with remarkable patience despite Auren''s complete lack of martial ability.', 'supporting', 'active', 'Long-serving warrior of House Thorne who has the thankless task of training the untrainable prince.', ARRAY['patient', 'stoic', 'loyal', 'long-suffering'], TRUE),
('c0000001-0001-0001-0002-000000000005', 'Nel', 'Fruit Vendor of Virelay', 'A sharp-eyed, warm fruit vendor who appears and disappears with the Fray''s fluctuations, symbolizing the town''s instability.', 'supporting', 'unknown', 'A simple vendor whose existence flickers in and out with the Fray, representing the human cost of the corruption.', ARRAY['warm', 'observant', 'ephemeral'], TRUE),
('c0000001-0001-0001-0002-000000000006', 'Brennick', 'Gate Guard', 'A slightly bored guard at House Thorne who wisely steps aside when Auren makes his dramatic escape.', 'supporting', 'active', 'A guard who has watched Auren grow up and knows better than to stand in his way.', ARRAY['bored', 'wise', 'accommodating'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- Story 2 Locations
INSERT INTO locations (id, name, description, region, terrain_type, significance, notable_features, is_canon) VALUES
('10000001-0001-0001-0002-000000000001', 'Virelay', 'A coastal town consumed by the Fray. Buildings appear and disappear, people are forgotten between heartbeats, and reality refuses to hold still. The fish always bite in one specific spot offshore—a clue to the Shard''s location beneath the sea.', 'Coastal Region', 'port town', 'Major Fray-corrupted location. Site of an underwater Shard discovery.', ARRAY['Shifting Architecture', 'The Oar and Candle Inn', 'Harbor', 'Underwater Well'], TRUE),
('10000001-0001-0001-0002-000000000002', 'Thorne Manor', 'The ancestral home of House Thorne, featuring the Winter Room where the family dines, extensive grounds, and protective walls that Auren sneaks past.', 'House Thorne Lands', 'manor', 'Seat of House Thorne. Where Auren was raised.', ARRAY['Winter Room', 'Training Courtyard', 'West-facing Balcony', 'Gardens'], TRUE),
('10000001-0001-0001-0002-000000000003', 'The Cracked Pot', 'A tavern near Virelay where Auren accidentally defeats a drunk through sheer clumsiness, becoming a local legend.', 'Between Thorne and Virelay', 'tavern', 'Site of Auren''s first accidental victory.', ARRAY['Brass Drink Bell', 'Cozy Interior'], TRUE),
('10000001-0001-0001-0002-000000000004', 'The Underwater Chamber', 'A room that exists impossibly beneath the sea, accessible through a stone well on the seafloor. Contains a hearth with a fire that shouldn''t exist and a Shard that glows red-gold before turning black.', 'Beneath Virelay''s Waters', 'underwater', 'Location of the Virelay Shard. Floods and collapses after the Shard is claimed.', ARRAY['Impossible Hearth', 'Shard Ember', 'Collapsing Walls'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- Story 2 Lore
INSERT INTO lore_entries (id, title, content, category, tags, is_canon) VALUES
('e0000001-0001-0001-0002-000000000001', 'The First Map', 'Mentioned in the Prologue—a map that bloomed into being the moment the Pattern was cast, etched by thought alone. It shows cities unborn, rivers unnamed, futures unchosen. Not a guide, but a memory.', 'artifacts', ARRAY['First Map', 'Pattern', 'First Architects', 'Memory'], TRUE),
('e0000001-0001-0001-0002-000000000002', 'Fray Effects on Reality', 'In Virelay, the Fray causes buildings to appear and vanish, streets to rearrange, people to be forgotten, rooms to exist one moment and not the next. The inn gains staircases to nowhere, and vendors exist and don''t exist simultaneously.', 'phenomena', ARRAY['Fray', 'Reality Distortion', 'Memory Loss', 'Spatial Anomalies'], TRUE),
('e0000001-0001-0001-0002-000000000003', 'The Shards as Prison Safeguards', 'The Scholars believe the Shards were safeguards placed by the Architects. But a darker question emerges: Why would a perfect loop require safeguards at all? What flaw did the Architects see? If the Pattern was a prison—what was it meant to hold?', 'cosmology', ARRAY['Shards', 'Pattern', 'Prison', 'First Architects', 'Mystery'], TRUE),
('e0000001-0001-0001-0002-000000000004', 'House Thorne', 'A noble house whose lords care deeply for their people. Their trade lines and rivers depend on Virelay''s stability. They believe in protecting both their subjects and their family, sometimes in conflict.', 'factions', ARRAY['House Thorne', 'Nobility', 'Trade', 'Protection'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORY 3: THE BALLAD OF ROOK AND MYX
-- ============================================

-- Story 3 Record
INSERT INTO stories (id, title, synopsis, content, word_count, status, is_canon, created_at) VALUES (
  'a0000001-0001-0001-0001-000000000003',
  'The Ballad of Rook and Myx',
  'Rook, a cunning survivor, and Myx, his Servine companion, arrive in a Fray-touched village ruled by Sera, a girl who has become a tyrant by controlling access to a tower that dampens the Fray. Through manipulation and eventual compassion, they overthrow her regime—but Myx''s sacrifice to channel the Fray leads them to claim another Shard.',
  '{"type": "founding_story", "chapters": 12, "summary": "Rook infiltrates Sera''s cult-like community, gains her trust while secretly rallying the villagers, and eventually helps them see through her lies. Myx, a telepathic Servine creature, ventures into the Fray to draw its power to the tower, cracking it open. Rook enters the void-like tower interior, solves a glyph puzzle, and pulls free a shard that collapses the tower entirely."}',
  11700,
  'approved',
  TRUE,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Story 3 Characters
INSERT INTO characters (id, name, title, description, role, status, backstory, personality_traits, is_canon) VALUES
('c0000001-0001-0001-0003-000000000001', 'Rook', 'The Teller of Tales', 'A cunning survivor and con artist who speaks for both himself and his silent companion Myx. Orphaned at five when his mother had to leave him, he grew up learning to survive through wit and stories.', 'protagonist', 'active', 'Left behind a butcher''s tent at age five by a mother who couldn''t afford to keep him. Grew up in the shadow of cruel "Protectors" who exploited the weak. Learned that stories can topple regimes.', ARRAY['cunning', 'charismatic', 'survivor', 'empathetic', 'storyteller', 'rebellious'], TRUE),
('c0000001-0001-0001-0003-000000000002', 'Myx', 'The Servine', 'A mysterious creature called a Servine, with eyes that change color based on emotion or intent. Communicates telepathically with Rook. Bears deep trauma from being bred for fighting.', 'protagonist', 'active', 'Born in a fighting pit, one of five. Trained through starvation and violence. Was forced to fight his own siblings. Escaped, nearly starved on the streets, until Rook found him and gave him purpose. His sacrifice to channel the Fray opened the tower.', ARRAY['loyal', 'telepathic', 'traumatized', 'fierce', 'protective', 'color-shifting eyes'], TRUE),
('c0000001-0001-0001-0003-000000000003', 'Sera', 'The False Queen', 'A young woman who discovered the tower''s Fray-dampening properties and built a cult of fear around access to its protection. Genuinely believed she was creating order, but became cruel in the process.', 'antagonist', 'active', 'Tired of being nothing, she seized power when she found the tower. Began rationing peace itself. Fell for Rook and offered to share power, but was ultimately exposed and overthrown.', ARRAY['ambitious', 'lonely', 'fearful', 'corrupted', 'redeemable'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- Story 3 Locations
INSERT INTO locations (id, name, description, region, terrain_type, significance, notable_features, is_canon) VALUES
('10000001-0001-0001-0003-000000000001', 'The Black Tower', 'An obsidian spire that dampened the Fray in its vicinity, creating a zone of stability that Sera weaponized. At its base was a crack that grew larger as the Fray pressed against it. Eventually collapsed after Rook claimed the Shard within.', 'Fray-touched Village', 'structure', 'Housed a Shard that stabilized local reality. Its destruction freed the area from both the Fray and Sera''s control.', ARRAY['Obsidian Walls', 'Fray-Dampening Field', 'Base Fracture', 'Void Interior', 'Glyph Puzzle'], TRUE),
('10000001-0001-0001-0003-000000000002', 'Sera''s Village', 'A Fray-touched settlement where Sera established her rule. People competed for proximity to the tower''s stabilizing effect, creating a hierarchy of fear.', 'Unknown Region', 'village', 'Site of Sera''s brief tyranny and subsequent liberation by Rook.', ARRAY['Silk Tent Throne', 'Fear-Based Hierarchy', 'Tower Proximity System'], TRUE),
('10000001-0001-0001-0003-000000000003', 'The Tower Interior', 'An impossible void within the Black Tower. No floor, no walls in the traditional sense. Rook floated in infinite darkness until he found glyphs that revealed a passage to the Shard chamber.', 'Inside the Black Tower', 'void', 'Interdimensional space containing the Shard. Required solving a glyph sequence to access the inner chamber.', ARRAY['Zero Gravity', 'Floating Navigation', 'Glyph Wall', 'Mini-Tower with Roots'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- Story 3 Lore
INSERT INTO lore_entries (id, title, content, category, tags, is_canon) VALUES
('e0000001-0001-0001-0003-000000000001', 'Servines', 'Mysterious creatures with color-changing eyes that reflect their emotional or mental state. They can communicate telepathically with bonded companions. Some were bred for fighting, trained through starvation and violence. They absorb emotions and truths that people won''t speak aloud.', 'creatures', ARRAY['Servine', 'Telepathy', 'Bond', 'Color-Changing Eyes'], TRUE),
('e0000001-0001-0001-0003-000000000002', 'The Tower''s Glyph Sequence', 'Inside the Black Tower, ancient glyphs on the walls required a specific sequence to open the path to the Shard: Blue spiral → Broken hourglass → Eye with no pupil → Thorned loop. These symbols correspond to the loops of the Everloop game.', 'puzzles', ARRAY['Glyphs', 'Tower', 'Sequence', 'Everloop'], TRUE),
('e0000001-0001-0001-0003-000000000003', 'The Rooted Shard', 'Inside the tower''s inner chamber, a miniature replica of the tower sat anchored by root-like tendrils feeding into the floor. When Rook pulled it free, the roots screamed with memory and sorrow, and the entire structure collapsed, the mini-tower folding down into a palm-sized Shard.', 'artifacts', ARRAY['Shard', 'Tower', 'Roots', 'Collapse'], TRUE),
('e0000001-0001-0001-0003-000000000004', 'Fear as Currency', 'In Sera''s village, proximity to the tower became the measure of status. The closer you lived to the stabilizing field, the safer you felt. Sera controlled who got peace and who suffered the Fray''s effects, turning fear itself into a currency of control.', 'social', ARRAY['Fear', 'Control', 'Tyranny', 'Stability'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORY 4: IN SERVICE OF THE VEYKAR
-- ============================================

-- Story 4 Record
INSERT INTO stories (id, title, synopsis, content, word_count, status, is_canon, created_at) VALUES (
  'a0000001-0001-0001-0001-000000000004',
  'In Service of the Veykar',
  'A young girl''s village is destroyed by the conquering Veykar, a warlord building an empire. She survives the brutal kitchens, rises through skill to become the Veykar''s personal cook, and ultimately poisons him—reclaiming her name, Nyra, and vanishing into legend.',
  '{"type": "founding_story", "chapters": 10, "summary": "The girl with the scar is taken as a child when the Veykar''s army destroys her village. She endures horrific conditions in the war camp kitchens, never crying, never breaking. Her exceptional cooking skill catches the attention of the Draethan (the Veykar''s elite), and she eventually becomes the Veykar''s personal chef. When a crippled boy who dreamed of freedom is executed, she realizes the truth about her own complicity. She poisons the Veykar, reveals her name for the first time—Nyra—and disappears forever."}',
  8500,
  'approved',
  TRUE,
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Story 4 Characters
INSERT INTO characters (id, name, title, description, role, status, backstory, personality_traits, is_canon) VALUES
('c0000001-0001-0001-0004-000000000001', 'Nyra', 'The Silent Cook', 'A girl taken as a child when the Veykar conquered her village. She never spoke, never cried, but watched everything. Her exceptional cooking skill raised her from the brutal pits to the Veykar''s personal kitchen. She eventually poisoned him and vanished.', 'protagonist', 'unknown', 'Her family was killed when she was five. A gash split her brow in the attack. She survived the nightmare of the war camp kitchens through silent determination and extraordinary skill.', ARRAY['silent', 'observant', 'patient', 'skilled', 'vengeful', 'survivor'], TRUE),
('c0000001-0001-0001-0004-000000000002', 'The Veykar', 'Conqueror and Empire-Builder', 'A warlord who united the tribes through slaughter and order. He spoke of unity and peace while building roads on blood. He trusted Nyra more than anyone, seeing in her skill a kindred spirit of excellence. His death came from the only person he truly trusted.', 'antagonist', 'deceased', 'Had no bloodline worth boasting—he seized power through sheer will and fire. Built an empire from chaos, bringing brutal order wherever he went. Decorated his tent with the severed hands of those who failed him.', ARRAY['ruthless', 'visionary', 'terrifying', 'lonely', 'trusting of skill'], TRUE),
('c0000001-0001-0001-0004-000000000003', 'The Crippled Boy', 'The Dreamer', 'A boy with a twisted leg who was sent to the kitchens. Unlike others, he never stopped speaking of hope, escape, green forests beyond the Veykar''s reach. He carved a tiny fox for Nyra. His execution for whispered rebellion sparked her final act.', 'supporting', 'deceased', 'Came to the kitchens broken but not defeated. His poetry and dreams of freedom slowly cracked Nyra''s emotional armor. He was caught with a half-drawn map and executed.', ARRAY['hopeful', 'dreamer', 'rebellious', 'gentle', 'doomed'], TRUE),
('c0000001-0001-0001-0004-000000000004', 'Morran', 'The Old Chef', 'The Veykar''s original personal chef, whose hands now hang among the trophies in the Veykar''s tent. His fate demonstrated what happened to those who fell short.', 'supporting', 'deceased', 'Served the Veykar for years with competent but uninspired cooking. Was replaced by Nyra and executed for an unknown failure.', ARRAY['competent', 'resentful', 'traditional', 'doomed'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- Story 4 Locations
INSERT INTO locations (id, name, description, region, terrain_type, significance, notable_features, is_canon) VALUES
('10000001-0001-0001-0004-000000000001', 'The Wheel', 'The Veykar''s moving war camp, organized in concentric rings. Outer ring: latrines, stables, butcher grounds. Middle ring: soldiers'' quarters. Inner ring: command tents, archives, the Hall. Center: the Veykar''s tent.', 'Mobile', 'war camp', 'The living machine of the Veykar''s conquest. Eventually stopped moving and became the foundation of a permanent city.', ARRAY['Concentric Organization', 'The Hall at Center', 'Mobile Structure'], TRUE),
('10000001-0001-0001-0004-000000000002', 'The Hall', 'The massive kitchen-pavilion at the center of the Wheel. Half sunken into rock, half built upon it. Here food became ceremony and hierarchy was enforced through what you were allowed to eat.', 'Center of the Wheel', 'kitchen', 'The engine of the empire. Food determined status: scraps for common soldiers, better cuts for commanders, precise ceremonial meals for the Draethan, sculptural feasts for the Veykar.', ARRAY['Fire Pits', 'Smoke Channels', 'Stone and Bone Construction', 'Hierarchical Serving'], TRUE),
('10000001-0001-0001-0004-000000000003', 'The Veykar''s Tent', 'A massive structure of beast-hide dyed maroon, with iron stakes and impossibly high ceilings. Lined with severed hands of those who failed. Contains a throne too large for any man and luxuries from conquered lands.', 'Center of the Wheel', 'throne room', 'The heart of the Veykar''s power. Where Nyra served and where she ultimately killed him.', ARRAY['Throne of Power', 'Trophy Hands', 'Golden Bowl of Melted Jewelry', 'Water Table', 'Spice Collection'], TRUE),
('10000001-0001-0001-0004-000000000004', 'The Pits', 'The brutal kitchen-trenches where new slaves were broken through backbreaking labor, burns, starvation, and endless suffering. Where Nyra began and where she learned to be unbreakable.', 'Outer Wheel', 'labor camp', 'The hell that forged Nyra. Digging trenches, hauling wood, tending fires that burned without kindness.', ARRAY['Dug Trenches', 'Constant Smoke', 'Brutal Labor', 'No Names'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- Story 4 Lore
INSERT INTO lore_entries (id, title, content, category, tags, is_canon) VALUES
('e0000001-0001-0001-0004-000000000001', 'The Draethan', 'The Veykar''s most elite followers, more than guards—his voice, ears, breath, and blood made flesh. They wear black robes made from horse hides of conquered peoples, dyed with ash and pitch. Oaths are tattooed from wrist to throat to jaw. One Draethan alone could end a conversation; ten could end a town.', 'factions', ARRAY['Draethan', 'Veykar', 'Elite', 'Enforcers'], TRUE),
('e0000001-0001-0001-0004-000000000002', 'Food as Power', 'In the Veykar''s empire, food determined status absolutely. Scraps and gristle for bleeding soldiers. Better cuts for commanders. Precise ceremonial meals for the Draethan. Sculptural feasts for the Veykar himself. What you ate declared exactly where you stood.', 'social', ARRAY['Food', 'Hierarchy', 'Status', 'Power'], TRUE),
('e0000001-0001-0001-0004-000000000003', 'The Trophy Hands', 'The Veykar decorated his tent with the severed, preserved hands of those who failed him. Dozens lined the walls, some small, some large, all bearing the calluses of their final acts. Among them hung Morran''s hands—the old chef who preceded Nyra.', 'customs', ARRAY['Trophies', 'Punishment', 'Veykar', 'Fear'], TRUE),
('e0000001-0001-0001-0004-000000000004', 'Nyra''s Silence', 'Nyra did not speak for years after her capture. Not from inability, but from choice—she buried her pain so deep that words became unnecessary. When she finally spoke, it was first to agree to serve the Veykar, and last to name herself before vanishing forever.', 'characters', ARRAY['Nyra', 'Silence', 'Trauma', 'Identity'], TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- LINK STORIES TO CHARACTERS (story_characters join table if exists)
-- ============================================
-- Note: This section creates the join table if needed and links stories to characters

-- Create story_characters join table if it doesn't exist
CREATE TABLE IF NOT EXISTS story_characters (
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
  role_in_story TEXT,
  PRIMARY KEY (story_id, character_id)
);

-- Link Story 1 characters
INSERT INTO story_characters (story_id, character_id, role_in_story) VALUES
('a0000001-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000001', 'protagonist'),
('a0000001-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000002', 'protagonist'),
('a0000001-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000003', 'protagonist'),
('a0000001-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000004', 'mentor'),
('a0000001-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000005', 'supporting'),
('a0000001-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000006', 'supporting'),
('a0000001-0001-0001-0001-000000000001', 'c0000001-0001-0001-0001-000000000007', 'ally')
ON CONFLICT DO NOTHING;

-- Link Story 2 characters
INSERT INTO story_characters (story_id, character_id, role_in_story) VALUES
('a0000001-0001-0001-0001-000000000002', 'c0000001-0001-0001-0002-000000000001', 'protagonist'),
('a0000001-0001-0001-0001-000000000002', 'c0000001-0001-0001-0002-000000000002', 'supporting'),
('a0000001-0001-0001-0001-000000000002', 'c0000001-0001-0001-0002-000000000003', 'supporting'),
('a0000001-0001-0001-0001-000000000002', 'c0000001-0001-0001-0002-000000000004', 'supporting'),
('a0000001-0001-0001-0001-000000000002', 'c0000001-0001-0001-0002-000000000005', 'supporting'),
('a0000001-0001-0001-0001-000000000002', 'c0000001-0001-0001-0002-000000000006', 'supporting')
ON CONFLICT DO NOTHING;

-- Link Story 3 characters
INSERT INTO story_characters (story_id, character_id, role_in_story) VALUES
('a0000001-0001-0001-0001-000000000003', 'c0000001-0001-0001-0003-000000000001', 'protagonist'),
('a0000001-0001-0001-0001-000000000003', 'c0000001-0001-0001-0003-000000000002', 'protagonist'),
('a0000001-0001-0001-0001-000000000003', 'c0000001-0001-0001-0003-000000000003', 'antagonist')
ON CONFLICT DO NOTHING;

-- Link Story 4 characters
INSERT INTO story_characters (story_id, character_id, role_in_story) VALUES
('a0000001-0001-0001-0001-000000000004', 'c0000001-0001-0001-0004-000000000001', 'protagonist'),
('a0000001-0001-0001-0001-000000000004', 'c0000001-0001-0001-0004-000000000002', 'antagonist'),
('a0000001-0001-0001-0001-000000000004', 'c0000001-0001-0001-0004-000000000003', 'supporting'),
('a0000001-0001-0001-0001-000000000004', 'c0000001-0001-0001-0004-000000000004', 'supporting')
ON CONFLICT DO NOTHING;

-- ============================================
-- LINK STORIES TO LOCATIONS (story_locations join table if exists)
-- ============================================

-- Create story_locations join table if it doesn't exist
CREATE TABLE IF NOT EXISTS story_locations (
  story_id UUID REFERENCES stories(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  PRIMARY KEY (story_id, location_id)
);

-- Link Story 1 locations
INSERT INTO story_locations (story_id, location_id) VALUES
('a0000001-0001-0001-0001-000000000001', '10000001-0001-0001-0001-000000000001'),
('a0000001-0001-0001-0001-000000000001', '10000001-0001-0001-0001-000000000002'),
('a0000001-0001-0001-0001-000000000001', '10000001-0001-0001-0001-000000000003'),
('a0000001-0001-0001-0001-000000000001', '10000001-0001-0001-0001-000000000004')
ON CONFLICT DO NOTHING;

-- Link Story 2 locations
INSERT INTO story_locations (story_id, location_id) VALUES
('a0000001-0001-0001-0001-000000000002', '10000001-0001-0001-0002-000000000001'),
('a0000001-0001-0001-0001-000000000002', '10000001-0001-0001-0002-000000000002'),
('a0000001-0001-0001-0001-000000000002', '10000001-0001-0001-0002-000000000003'),
('a0000001-0001-0001-0001-000000000002', '10000001-0001-0001-0002-000000000004')
ON CONFLICT DO NOTHING;

-- Link Story 3 locations
INSERT INTO story_locations (story_id, location_id) VALUES
('a0000001-0001-0001-0001-000000000003', '10000001-0001-0001-0003-000000000001'),
('a0000001-0001-0001-0001-000000000003', '10000001-0001-0001-0003-000000000002'),
('a0000001-0001-0001-0001-000000000003', '10000001-0001-0001-0003-000000000003')
ON CONFLICT DO NOTHING;

-- Link Story 4 locations
INSERT INTO story_locations (story_id, location_id) VALUES
('a0000001-0001-0001-0001-000000000004', '10000001-0001-0001-0004-000000000001'),
('a0000001-0001-0001-0001-000000000004', '10000001-0001-0001-0004-000000000002'),
('a0000001-0001-0001-0001-000000000004', '10000001-0001-0001-0004-000000000003'),
('a0000001-0001-0001-0001-000000000004', '10000001-0001-0001-0004-000000000004')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFY IMPORT
-- ============================================
-- Run these queries to verify the import worked:

-- SELECT 'Stories' as type, COUNT(*) as count FROM stories WHERE is_canon = TRUE;
-- SELECT 'Characters' as type, COUNT(*) as count FROM characters WHERE is_canon = TRUE;
-- SELECT 'Locations' as type, COUNT(*) as count FROM locations WHERE is_canon = TRUE;
-- SELECT 'Lore Entries' as type, COUNT(*) as count FROM lore_entries WHERE is_canon = TRUE;

-- ============================================
-- CANON CONTRIBUTIONS (for The Living Weave feed)
-- ============================================
-- Add entries to canon_contributions table for the founding stories

INSERT INTO canon_contributions (id, contribution_type, reference_id, title, description, status, canon_impact, created_at) VALUES
('b0000001-0001-0001-0001-000000000001', 'story', 'a0000001-0001-0001-0001-000000000001', 'The Bell Tree and The Broken World', 'The first founding story introducing the siblings Kerr, Mira, and Thom, the mysterious Bell Trees, and the concept of the Thirteen Shards.', 'approved', 'Establishes core lore: Bell Trees, Shards, Folding, the Fray', NOW()),
('b0000001-0001-0001-0001-000000000002', 'story', 'a0000001-0001-0001-0001-000000000002', 'The Prince and the Drowning City', 'Prince Auren Thorne braves the Fray-corrupted town of Virelay to discover an underwater Shard.', 'approved', 'Establishes House Thorne, Virelay, underwater Shard chambers', NOW()),
('b0000001-0001-0001-0001-000000000003', 'story', 'a0000001-0001-0001-0001-000000000003', 'The Ballad of Rook and Myx', 'Rook and his Servine companion Myx overthrow a tyrant and claim a Shard from the Black Tower.', 'approved', 'Establishes Servines, the Black Tower, glyph puzzles', NOW()),
('b0000001-0001-0001-0001-000000000004', 'story', 'a0000001-0001-0001-0001-000000000004', 'In Service of the Veykar', 'Nyra''s tale of survival and revenge in the Veykar''s brutal war camp.', 'approved', 'Establishes the Veykar, the Draethan, the Wheel', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add character contributions
INSERT INTO canon_contributions (id, contribution_type, reference_id, title, description, status, canon_impact, created_at) VALUES
('b0000001-0001-0001-0002-000000000001', 'character', 'c0000001-0001-0001-0001-000000000001', 'Kaerlin (Kerr)', 'The First Witness - eldest of the three siblings who discovers the Bell Tree.', 'approved', 'Primary protagonist of Story 1', NOW()),
('b0000001-0001-0001-0002-000000000002', 'character', 'c0000001-0001-0001-0002-000000000001', 'Auren Thorne', 'The Lord of Luck - a prince who cannot fight but whose courage leads him to claim a Shard.', 'approved', 'Primary protagonist of Story 2', NOW()),
('b0000001-0001-0001-0002-000000000003', 'character', 'c0000001-0001-0001-0003-000000000001', 'Rook', 'The Teller of Tales - a cunning survivor who speaks for himself and his Servine companion Myx.', 'approved', 'Primary protagonist of Story 3', NOW()),
('b0000001-0001-0001-0002-000000000004', 'character', 'c0000001-0001-0001-0004-000000000001', 'Nyra', 'The Silent Cook - a girl who rose from the pits to poison the Veykar.', 'approved', 'Primary protagonist of Story 4', NOW()),
('b0000001-0001-0001-0002-000000000005', 'character', 'c0000001-0001-0001-0003-000000000002', 'Myx', 'The Servine - a telepathic creature with color-changing eyes, bonded to Rook.', 'approved', 'Introduces Servine species', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add location contributions
INSERT INTO canon_contributions (id, contribution_type, reference_id, title, description, status, canon_impact, created_at) VALUES
('b0000001-0001-0001-0003-000000000001', 'location', '10000001-0001-0001-0001-000000000001', 'Drelmere', 'A small town that becomes the site of the Bell Tree''s appearance and the Second Shard discovery.', 'approved', 'Key location in Story 1', NOW()),
('b0000001-0001-0001-0003-000000000002', 'location', '10000001-0001-0001-0002-000000000001', 'Virelay', 'A coastal town consumed by the Fray where reality refuses to hold still.', 'approved', 'Key location in Story 2', NOW()),
('b0000001-0001-0001-0003-000000000003', 'location', '10000001-0001-0001-0003-000000000001', 'The Black Tower', 'An obsidian spire that dampened the Fray and housed a Shard.', 'approved', 'Key location in Story 3', NOW()),
('b0000001-0001-0001-0003-000000000004', 'location', '10000001-0001-0001-0004-000000000001', 'The Wheel', 'The Veykar''s moving war camp organized in concentric rings.', 'approved', 'Key location in Story 4', NOW())
ON CONFLICT (id) DO NOTHING;

-- Add lore contributions
INSERT INTO canon_contributions (id, contribution_type, reference_id, title, description, status, canon_impact, created_at) VALUES
('b0000001-0001-0001-0004-000000000001', 'lore', 'e0000001-0001-0001-0001-000000000001', 'The Bell Trees', 'Mysterious trees that appear suddenly and ring without wind, marking the awakening of Shards.', 'approved', 'Core phenomenon of the Everloop', NOW()),
('b0000001-0001-0001-0004-000000000002', 'lore', 'e0000001-0001-0001-0001-000000000003', 'The Thirteen Shards', 'Remnants of the original Pattern placed by the First Architects as safeguards.', 'approved', 'Core cosmology of the Everloop', NOW()),
('b0000001-0001-0001-0004-000000000003', 'lore', 'e0000001-0001-0001-0003-000000000001', 'Servines', 'Mysterious creatures with color-changing eyes that can communicate telepathically.', 'approved', 'Major creature species', NOW()),
('b0000001-0001-0001-0004-000000000004', 'lore', 'e0000001-0001-0001-0004-000000000001', 'The Draethan', 'The Veykar''s elite followers - his voice, ears, breath, and blood made flesh.', 'approved', 'Major faction', NOW())
ON CONFLICT (id) DO NOTHING;
