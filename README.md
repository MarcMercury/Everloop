# Everloop

A collaborative story engine where every contributor's tale becomes part of a shared universe. Built with Next.js, Supabase, and TipTap.

![Everloop](https://img.shields.io/badge/version-1.0.0-blue) ![Next.js](https://img.shields.io/badge/Next.js-16-black) ![Supabase](https://img.shields.io/badge/Supabase-green)

## 🌌 Overview

Everloop is a web-first, desktop-optimized collaborative writing platform where writers contribute stories to a shared fictional universe. Unlike open wikis or fanfic archives, Everloop enforces canon consistency through AI-assisted review while encouraging individual creative expression.

### Key Features

- **🖋️ Rich Text Editor** - TipTap-powered editor with formatting tools
- **🤖 AI Canon Assistant** - Real-time guidance for universe consistency  
- **🔍 Canon Review System** - AI-powered review for lore, rules, and tone
- **📚 Story Types** - Support for short-form, long-form, and branch stories
- **🏛️ Canon Management** - Admin tools for arcs, locations, characters, and rules
- **🌐 Explore Archive** - Browse and read approved canonical stories

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/MarcMercury/Everloop.git
   cd Everloop
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

4. **Set up the database**
   
   Run the SQL schema in your Supabase SQL Editor:
   - Open `supabase/schema.sql`
   - Copy the entire contents
   - Paste and run in Supabase SQL Editor

5. **Configure Supabase Auth**
   
   In your Supabase dashboard:
   - Enable Email authentication
   - (Optional) Enable Google OAuth
   - Set Site URL to `http://localhost:3000` for development

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open the app**
   
   Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin panel for canon management
│   ├── api/               # API routes
│   │   ├── canon/         # Canon entity CRUD endpoints
│   │   └── stories/       # Story CRUD and review endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboard
│   ├── editor/[id]/       # Story editor
│   ├── explore/           # Browse approved stories
│   └── story/             # Story creation and viewing
├── components/            # React components
│   ├── AIAssistant.tsx   # AI chat assistant
│   ├── CanonReviewModal.tsx  # Canon review display
│   ├── OnboardingModal.tsx   # New user onboarding
│   └── TipTapEditor.tsx  # Rich text editor
├── lib/
│   ├── store.ts          # Zustand state management
│   └── supabase/         # Supabase client configuration
└── types/
    └── database.ts       # TypeScript types
```

## 🎨 Design System

Everloop uses a dark, contemplative theme:

- **Background**: Charcoal (`#0f1419`) and Navy (`#161d26`)
- **Accents**: Blue (`#1e3a5f`), Purple (`#2d1f4e`), Gold (`#c9a227`)
- **Typography**: Crimson Text (serif headings), Inter (body)

## 📖 Story Types

| Type | Description | Word Count |
|------|-------------|------------|
| **Short-Form** | Flash fiction, vignettes | 500-3,000 |
| **Long-Form** | Full stories, novellas | 3,000-50,000 |
| **Branch** | Continue from existing story | Any |

## 🔒 Canon Review Process

1. Writer submits story for review
2. AI checks for:
   - Lore conflicts (characters, events, places)
   - Rule violations (magic system, history)
   - Tone consistency
3. Results show blocking issues vs. suggestions
4. Writer can revise and resubmit
5. Approved stories become part of canon

## 🛠️ Development

### Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Database Schema

The database includes:
- `profiles` - User profiles linked to auth
- `stories` - Main story content
- `story_metadata` - Story connections to canon entities
- `arcs` - Major story arcs
- `locations` - Places in the universe
- `characters` - Canon characters
- `time_periods` - Chronological eras
- `rules` - Universe rules and constraints
- `canon_reviews` - AI review results
- `ai_commit_logs` - Track AI-assisted content

## 🌍 The Everloop Universe

### Core Concepts

- **Weavers**: Those who can manipulate the threads of reality
- **The Cosmic Loom**: The source of all Weaving power
- **The Fray**: A chaotic force threatening to unravel reality
- **The Sundering**: A cataclysmic event 1,000 years ago
- **Shards**: Crystallized fragments of reality with power

### Time Periods

1. The First Age
2. The Age of Binding
3. The Sundering Era
4. The Reconstruction
5. The Modern Age

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

---

Built with ❤️ for collaborative storytelling.
