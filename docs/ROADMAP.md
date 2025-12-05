# Everloop Feature Roadmap

## Vision
Transform Everloop from a collaborative story engine into a full creative universe platform — part writing tool, part world-builder, part interactive experience.

---

## ✅ V1 - Foundation (Current)
*Status: Complete*

- [x] User authentication (email + OAuth)
- [x] Story creation (short, long, branch types)
- [x] Three-panel editor with TipTap
- [x] AI writing assistant (mock)
- [x] Canon review system
- [x] Universe anchoring (arcs, locations, characters, time periods)
- [x] Explore/Archive page
- [x] Admin panel for canon management
- [x] Dark theme UI
- [x] Supabase backend

---

## 🚀 V2 - The Creative Toolkit
*Target: Q1 2026*

### 🗺️ 2.1 The Everloop Map Lab
Fantasy-style interactive map maker tuned to Everloop's world rules.

**Features:**
- Drag-and-drop placement: mountains, rivers, Bell Trees, Hollows, Drift lines, Fray zones
- Place settlements, Shard sites, ruins, folded structures
- "Story Paths" — visual connections showing how stories thread across the world
- Export maps directly into story drafts
- Tag maps: "Public Canon" | "Branch Canon" | "Private Sandbox"

**AI Layer:**
- When placing new locations: "Turn this into a story seed, lore entry, or quest hook?"
- Gentle warnings if placement contradicts known geography or rules

**Tech Stack:**
- React Flow or Pixi.js for canvas
- Custom asset library
- Real-time collaboration via Supabase Realtime

---

### ⚔️ 2.2 Interactive Quest Builder
Lightweight branching mini-quest designer.

**Features:**
- No-code flowchart interface
- Choices → Consequences logic
- Optional combat/puzzle/mystery elements
- Built-in NPC creation tool
- Embed quests in stories or standalone
- Quest types: lore quest, mystery fragment, puzzle, Drift hallucination

**Tech Stack:**
- React Flow for node-based editing
- JSON schema for quest data
- Playable quest renderer component

---

### 🏛️ 2.3 The LoreForge — Canon Glossary & Character Vault
Structured encyclopedic section for world entries.

**Entry Types:**
- Characters (with creator credit + timeline of appearances)
- Locations
- Creatures
- Shards
- Houses, factions, religions
- Artifacts
- Mythologies
- Timeline events

**Each Entry Shows:**
- Creator credit
- Stories that reference it
- AI-checked tags (Folded Character, Dreamer, Weaving-compatible, etc.)
- Image gallery
- Public vs private visibility
- Canon status: draft → review → approved

---

### 🧬 2.4 Character & Creature Designer
Stripped-down creation tool for entities.

**Definable Fields:**
- Name, Origin
- Path role (Dreamer, Lantern, Weaver, Folded, etc.)
- Alignment with Shards
- Emotional arc
- Physical description
- "Behaviors in the Fray" patterns
- Portrait (upload or AI-generate)

**Magic Feature:**
- Creating a species prompts: "Make this an official species entry in the Everloop Bestiary?"

---

## 🌀 V3 - The Immersive Layer
*Target: Q2 2026*

### 🧿 3.1 Temporal Instability Simulator (Fray & Fold Visualizer)
Interactive playground for simulating Fray effects.

**Interactions:**
- Select location → watch it flicker through time-states
- Select character → apply Fold patterns (visual distortion + personality shifts)
- Create Fray "Events" and see predicted consequences
- Export instability sequences into story drafts

**Tech Stack:**
- WebGL shaders for visual effects
- Timeline animation system
- Integration with story editor

---

### 🧩 3.2 Story Path Tracker
Visual timeline tool for fractal, looping, branching narratives.

**Features:**
- Track chapters on branching node map
- Show character movement in/out of Drift
- Mark Shard appearances and influences
- Connect story arcs with other users' stories
- Export visual diagrams

---

### ⛓️ 3.3 Collaboration Contracts (Canon-Blend Mode)
Link multiple users' stories together.

**Features:**
- Shared characters
- Shared locations
- Shared plot intersections
- Permission-based editing
- Shared AI assistant tuned to combined lore

---

### 📚 3.4 The Everloop Story Desk
Unified dashboard merging all tools.

**Integrated Panels:**
- Document editor
- Map view
- Glossary reference
- Quest flow
- Timeline

**AI assistant has access to all context simultaneously.**

---

## 🔮 V4 - The Living Universe
*Target: Q3 2026*

### 4.1 "What If?" Lore Generator
One-click speculative branching.

**Example Prompts:**
- "What if this town is actually built on a Fold?"
- "What if Mira visited this village fifty years earlier?"
- "What if this character interacts with the Bell Tree?"
- "What if the Fray expands during this chapter?"

**AI generates Everloop-compatible branches adoptable with one click.**

---

### 4.2 Canon Status System (Enhanced)

| Status | Description |
|--------|-------------|
| **Public Canon** | Fully approved, part of the universe everyone respects |
| **Branch Canon** | Semi-canon, allowed to diverge, follows core lore rules |
| **Private Sandbox** | Fully private, zero rule requirements until submission |

---

### 4.3 Visual "Canon Weave" Map
Dynamic network visualization of all canon stories.

**Features:**
- Nodes = stories
- Lines = shared characters, events, lore
- Shards glow
- Fold events pulse
- Zoom in/out to explore connections

**Tech Stack:**
- D3.js or Vis.js for network visualization
- Real-time updates via Supabase subscriptions

---

## 👥 V5 - The Community Layer
*Target: Q4 2026*

### 🏅 5.1 Creator Profiles + Reputation System

**Profile Features:**
- Created entries (characters, locations, maps, quests)
- Contribution badges
- Followers
- "Lore Reputation" score
- "Master of..." titles (Master of Hollows, Weaver of Drift-Lines, etc.)

---

### 🏗️ 5.2 World Events and Seasonal Quests
Monthly/seasonal universe-wide challenges.

**Examples:**
- "The Fray Expands: Write a story involving instability."
- "Three New Houses Arise: Create a noble lineage."
- "The Lost Shard Appears: Design a short quest around it."

**Winning contributions become canon highlights.**

---

### 🎨 5.3 Custom Art Packs
User-contributed and unlockable visual assets.

**Asset Types:**
- Location art
- Character portraits
- Creature designs
- Map assets
- Symbol/iconography sets for Houses, Shards, Orders

---

### 🧭 5.4 Reader Mode
For audiences who want to explore without writing.

**Features:**
- Browse stories like a graphic novel feed
- Explore the Weave Map
- Play quests
- Browse character entries
- Follow creators
- Vote on seasonal events
- Collect lore fragments as achievements

---

## Technical Considerations

### Database Additions Needed
```sql
-- V2 additions
maps, map_elements, map_paths
quests, quest_nodes, quest_choices
lore_entries, lore_references
creatures, species, bestiary

-- V3 additions
collaborations, collaboration_members
story_connections, story_paths

-- V5 additions
user_badges, reputation_scores
events, event_submissions
art_packs, art_assets
achievements, user_achievements
```

### New Tech Stack Considerations
- **Canvas/WebGL**: Pixi.js or Konva for map maker
- **Node Editor**: React Flow for quest builder
- **Visualization**: D3.js for Canon Weave Map
- **Real-time**: Supabase Realtime for collaboration
- **AI**: OpenAI GPT-4 or Claude for intelligent suggestions
- **Image Gen**: DALL-E or Stable Diffusion for portraits

---

## Priority Matrix

| Feature | Impact | Effort | Priority |
|---------|--------|--------|----------|
| Map Lab | 🔥🔥🔥 | High | P1 |
| LoreForge | 🔥🔥🔥 | Medium | P1 |
| Quest Builder | 🔥🔥 | High | P2 |
| Character Designer | 🔥🔥 | Medium | P2 |
| Story Path Tracker | 🔥🔥 | Medium | P2 |
| Canon Weave Map | 🔥🔥🔥 | High | P2 |
| What If Generator | 🔥🔥🔥 | Low | P1 |
| Fray Visualizer | 🔥🔥 | Very High | P3 |
| Collaboration Mode | 🔥🔥 | High | P3 |
| Reader Mode | 🔥🔥🔥 | Medium | P2 |
| Reputation System | 🔥 | Medium | P3 |
| Seasonal Events | 🔥🔥 | Low | P3 |

---

## Next Steps

1. **Immediate**: Run seed.sql to populate initial canon data
2. **This Week**: Test V1 auth flow and story creation
3. **Next Sprint**: Begin LoreForge (enhanced canon glossary)
4. **Following Sprint**: Map Lab prototype

---

*This roadmap transforms Everloop from a writing tool into a creative universe platform — the world's first "Story MMO."*
