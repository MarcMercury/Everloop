-- Everloop Seed Data
-- Run this AFTER schema.sql has been applied

-- Time Periods
INSERT INTO time_periods (name, description, chronological_order) VALUES
  ('The First Age', 'The dawn of creation, when the Weavers first touched the threads of reality.', 1),
  ('The Age of Binding', 'When the great pacts were made between mortals and the cosmic forces.', 2),
  ('The Sundering Era', 'The cataclysmic period when the world was torn asunder.', 3),
  ('The Reconstruction', 'The slow rebuilding of civilization after the Sundering.', 4),
  ('The Modern Age', 'The current era, where old powers stir and new heroes rise.', 5)
ON CONFLICT DO NOTHING;

-- Arcs
INSERT INTO arcs (name, description, era, status) VALUES
  ('The Weavers Legacy', 'The foundational story of the first Weavers and their binding to the cosmic loom.', 'First Age', 'open'),
  ('The Fray Awakens', 'The emergence of the Fray, the chaotic force that threatens to unravel reality.', 'Sundering Era', 'open'),
  ('Children of the Binding', 'Stories of those born with the mark of the ancient pacts.', 'Modern Age', 'open'),
  ('The Lost Shards', 'The quest to recover fragments of power scattered during the Sundering.', 'Reconstruction', 'open'),
  ('Echoes of Verath', 'Tales centered around the ancient city of Verath and its secrets.', 'Various', 'open')
ON CONFLICT DO NOTHING;

-- Locations
INSERT INTO locations (name, region, description) VALUES
  ('Verath', 'The Heartlands', 'An ancient city built upon stones that remember. The seat of Weaver knowledge.'),
  ('The Fray Wastes', 'Eastern Reaches', 'Blighted lands where reality itself is unstable, touched by the Fray.'),
  ('Luminarch Spire', 'Northern Peaks', 'A tower of crystallized light, home to the Order of Luminarchs.'),
  ('The Binding Pools', 'Sacred Groves', 'Natural springs where the veil between worlds is thin.'),
  ('Shadowmere', 'The Underdark', 'A vast underground realm where those who fled the Sundering still dwell.')
ON CONFLICT DO NOTHING;

-- Characters
INSERT INTO characters (name, description, status, is_locked) VALUES
  ('Kira of the Threads', 'A young Weaver discovering her connection to the ancient loom.', 'alive', false),
  ('The Unbound One', 'A mysterious figure who severed their connection to the cosmic order.', 'unknown', true),
  ('Archweaver Theron', 'The last of the original Weavers, now in eternal slumber.', 'dormant', true),
  ('Lyssa Brighthollow', 'A scholar dedicated to preserving pre-Sundering knowledge.', 'alive', false),
  ('The Fray Herald', 'An entity that speaks for the chaotic force threatening reality.', 'active', true)
ON CONFLICT DO NOTHING;

-- Rules
INSERT INTO rules (category, rule_text, severity) VALUES
  ('Magic System', 'Weaving requires connection to the Cosmic Loom. No one can Weave without the Gift or a binding pact.', 'critical'),
  ('Magic System', 'The Fray corrupts Weaving. Prolonged exposure to Fray energy destabilizes a Weavers patterns.', 'critical'),
  ('History', 'The Sundering occurred exactly 1,000 years before the Modern Age. This timeline is fixed.', 'critical'),
  ('Geography', 'Verath is always located at the convergence of ley lines, in the center of the Heartlands.', 'standard'),
  ('Metaphysics', 'Death is not final for Weavers; their threads return to the Loom, but memories are lost.', 'critical'),
  ('Tone', 'Everloop is mythic and contemplative, not action-comedy or grimdark.', 'standard'),
  ('Characters', 'Canon characters core traits and histories cannot be contradicted without admin approval.', 'critical'),
  ('Magic System', 'Shards are fragments of crystallized reality. They cannot be created, only found or inherited.', 'standard')
ON CONFLICT DO NOTHING;
