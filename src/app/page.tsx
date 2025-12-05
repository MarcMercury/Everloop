import Link from 'next/link';
import { 
  BookOpen, 
  Sparkles, 
  Shield, 
  GitBranch, 
  Compass, 
  PenTool,
  Layers,
  CheckCircle,
  ChevronRight,
  FileText,
  Users,
  Lock
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] constellation-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-semibold font-serif">Everloop</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/explore" className="text-[var(--foreground-muted)] hover:text-white transition-colors">
                Explore
              </Link>
              <Link href="/auth/login" className="text-[var(--foreground-muted)] hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/auth/signup" className="btn-primary">
                Start Writing
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-[var(--accent-gold)] to-white bg-clip-text text-transparent">
              Everloop
            </span>
          </h1>
          <p className="text-2xl sm:text-3xl text-[var(--foreground-muted)] font-serif mb-6">
            Shared Story Engine
          </p>
          <p className="text-xl text-[var(--foreground)] mb-4 max-w-2xl mx-auto leading-relaxed">
            A collaborative story universe where writers build within a living world — guided by AI, grounded in canon.
          </p>
          <p className="text-[var(--foreground-muted)] mb-10 max-w-2xl mx-auto">
            Everloop is an existing fantasy universe. This platform lets writers contribute new stories to that universe while an AI assistant helps them write faster and stay consistent with the world&apos;s rules and lore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
              <PenTool className="w-5 h-5" />
              Start a Story
            </Link>
            <Link href="/explore" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
              <Compass className="w-5 h-5" />
              Explore the World
            </Link>
          </div>
        </div>

        {/* Decorative element */}
        <div className="max-w-4xl mx-auto mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--accent-blue)]/10 to-transparent blur-3xl" />
          <div className="relative border border-[var(--border)] rounded-xl bg-[var(--background-secondary)]/50 p-1">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-[var(--background-tertiary)] to-[var(--background-secondary)] flex items-center justify-center">
              <div className="text-center p-8">
                <div className="flex justify-center gap-2 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-2 h-2 rounded-full bg-[var(--accent-gold)]/50"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
                <p className="text-[var(--foreground-muted)] italic font-serif text-lg">
                  &quot;The ancient stones of Verath hummed with a frequency only the Weavers could perceive...&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What Everloop Is Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center mb-6">
            What Everloop Is
          </h2>
          <p className="text-xl text-[var(--foreground-muted)] text-center max-w-3xl mx-auto mb-16">
            Everloop is a fantasy universe with its own rules, history, and tone. This platform lets you step inside as a storyteller, contributing short or long narratives that become part of the shared canon — as long as they respect the world&apos;s underlying laws.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3">Pre-Existing Universe</h3>
              <p className="text-[var(--foreground-muted)]">
                Books and stories already exist in this world. You&apos;re joining an established mythology, not starting from scratch.
              </p>
            </div>
            
            <div className="card group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3">Curated Story Engine</h3>
              <p className="text-[var(--foreground-muted)]">
                Not personal avatars or chaotic roleplay. A focused platform for canon-compatible stories that expand the universe.
              </p>
            </div>
            
            <div className="card group">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-gold-muted)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-[var(--background)]" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-3">Shared Canon</h3>
              <p className="text-[var(--foreground-muted)]">
                Every accepted contribution becomes part of the ongoing Everloop saga, woven into the living tapestry of the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How Contributions Work Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--background-secondary)] border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center mb-4">
            How Contributions Work
          </h2>
          <p className="text-xl text-[var(--foreground-muted)] text-center mb-16">
            A structured path from idea to canon
          </p>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-semibold mb-4">Choose Your Story Type</h3>
                <p className="text-[var(--foreground-muted)] mb-6">
                  Select how you&apos;re contributing to the universe:
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]">
                    <FileText className="w-6 h-6 text-[var(--accent-blue)] mb-2" />
                    <h4 className="font-semibold mb-1">Short-Form Story</h4>
                    <p className="text-sm text-[var(--foreground-muted)]">A self-contained scene or episode</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]">
                    <BookOpen className="w-6 h-6 text-[var(--accent-purple)] mb-2" />
                    <h4 className="font-semibold mb-1">Long-Form Story</h4>
                    <p className="text-sm text-[var(--foreground-muted)]">A multi-chapter arc</p>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]">
                    <GitBranch className="w-6 h-6 text-[var(--accent-gold)] mb-2" />
                    <h4 className="font-semibold mb-1">Branch from Existing</h4>
                    <p className="text-sm text-[var(--foreground-muted)]">Extend or spin off an existing storyline</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--foreground-muted)] mt-4">
                  This choice helps organize the universe and prevents a mess of random fragments.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-semibold mb-4">Anchor to the Universe</h3>
                <p className="text-[var(--foreground-muted)] mb-4">
                  Connect your story to what already exists:
                </p>
                <ul className="space-y-2 text-[var(--foreground-muted)]">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--accent-gold)]" />
                    Select relevant existing arcs, locations, or characters
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--accent-gold)]" />
                    Choose a time period within Everloop&apos;s history
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-4 h-4 text-[var(--accent-gold)]" />
                    Link to known events and worldbuilding elements
                  </li>
                </ul>
                <p className="text-sm text-[var(--foreground-muted)] mt-4">
                  This creates logical connective tissue so new stories relate to known events instead of floating as detached fanfic.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-semibold mb-4">Write Inside the Everloop Editor</h3>
                <p className="text-[var(--foreground-muted)] mb-4">
                  Enter a custom writing environment designed for worldbuilding:
                </p>
                <ul className="space-y-2 text-[var(--foreground-muted)]">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                    Distraction-free writing space
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                    AI assistant that knows the universe
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--success)]" />
                    Real-time lore references and suggestions
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-2xl font-bold">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-serif font-semibold mb-4">Submit for Canon Check</h3>
                <p className="text-[var(--foreground-muted)] mb-4">
                  When you&apos;re done, submit for AI-powered consistency review:
                </p>
                <ul className="space-y-2 text-[var(--foreground-muted)]">
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[var(--accent-blue)]" />
                    Automatic check against Everloop&apos;s lore and rules
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[var(--accent-blue)]" />
                    Conflict flagging with specific revision suggestions
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[var(--accent-blue)]" />
                    Only canon-compatible stories are accepted
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Writing Environment Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center mb-4">
            The Everloop Writing Environment
          </h2>
          <p className="text-xl text-[var(--foreground-muted)] text-center mb-16">
            Where stories come to life within the universe
          </p>

          {/* Editor Mock */}
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 blur-3xl rounded-3xl" />
            <div className="relative border border-[var(--border)] rounded-xl bg-[var(--background-secondary)] overflow-hidden">
              <div className="flex border-b border-[var(--border)]">
                <div className="px-4 py-2 bg-[var(--background-tertiary)] text-sm text-[var(--foreground-muted)]">
                  Everloop Editor
                </div>
              </div>
              <div className="grid lg:grid-cols-3">
                {/* Editor Panel */}
                <div className="lg:col-span-2 p-6 border-r border-[var(--border)]">
                  <div className="space-y-4">
                    <p className="font-serif text-lg leading-relaxed">
                      The ancient stones of Verath hummed with a frequency only the Weavers could perceive. Kira pressed her palm against the cold surface, feeling centuries of...
                    </p>
                    <div className="w-0.5 h-5 bg-[var(--accent-gold)] animate-pulse inline-block" />
                  </div>
                </div>
                
                {/* AI Assistant Panel */}
                <div className="p-6 bg-[var(--background-tertiary)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-[var(--accent-gold)]" />
                    <span className="font-semibold">AI Assistant</span>
                  </div>
                  <div className="p-4 rounded-lg bg-[var(--background-secondary)] border border-[var(--border)] mb-4">
                    <p className="text-sm italic text-[var(--foreground-muted)] mb-3">
                      &quot;...feeling centuries of memory pulse through her veins. The Verath stones were said to remember every Weaver who had touched them since the First Binding.&quot;
                    </p>
                    <button className="btn-primary text-sm py-2 px-4 w-full flex items-center justify-center gap-2">
                      <span>+</span> Add to Story
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center mx-auto mb-4">
                <PenTool className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Desktop-First Editor</h3>
              <p className="text-[var(--foreground-muted)]">
                A distraction-free writing space optimized for laptops and desktops. Mobile is supported but simplified, with optional speech-to-text.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-gold)] flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">AI Writing Assistant</h3>
              <p className="text-[var(--foreground-muted)]">
                A hovering side panel that acts as your co-writer. It knows Everloop&apos;s rules, tone, and lore. Toggle it off anytime to write solo.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-gold)] to-[var(--accent-blue)] flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">Quick Commit / &quot;Add to Story&quot;</h3>
              <p className="text-[var(--foreground-muted)]">
                When the AI suggests text, hit &quot;Add to Story&quot; and it&apos;s instantly inserted at the cursor. No copy-paste required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Canon & Consistency Guardrails Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[var(--background-secondary)] border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center mb-4">
            Canon & Consistency Guardrails
          </h2>
          <p className="text-xl text-[var(--foreground-muted)] text-center mb-8">
            Protecting the integrity of the universe
          </p>
          
          {/* Quote */}
          <div className="max-w-3xl mx-auto mb-16 p-8 rounded-xl bg-gradient-to-r from-[var(--accent-blue)]/10 to-[var(--accent-purple)]/10 border border-[var(--accent-blue)]/30">
            <blockquote className="text-xl font-serif italic text-center text-[var(--foreground)]">
              &quot;An AI trained on Everloop&apos;s canon acts as a lore guardian, keeping every contribution aligned with the universe&apos;s laws so the world grows richer, not messier.&quot;
            </blockquote>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card">
              <Shield className="w-10 h-10 text-[var(--accent-blue)] mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2">AI Lore Review</h3>
              <p className="text-[var(--foreground-muted)]">
                After drafting, stories go through an automated review that checks continuity with existing Everloop stories.
              </p>
            </div>
            
            <div className="card">
              <Lock className="w-10 h-10 text-[var(--accent-purple)] mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2">Universe Rules Enforcement</h3>
              <p className="text-[var(--foreground-muted)]">
                Magic systems, history, geography, tone — the AI ensures your story respects all established world mechanics.
              </p>
            </div>
            
            <div className="card">
              <Sparkles className="w-10 h-10 text-[var(--accent-gold)] mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2">Conflict Detection</h3>
              <p className="text-[var(--foreground-muted)]">
                Contradictions are flagged with specific revision suggestions, helping you fix issues before submission.
              </p>
            </div>
            
            <div className="card">
              <GitBranch className="w-10 h-10 text-[var(--success)] mb-4" />
              <h3 className="text-xl font-serif font-semibold mb-2">Meaningful Integration</h3>
              <p className="text-[var(--foreground-muted)]">
                Stories must plug into the shared world meaningfully. No disconnected personal fantasies or incompatible settings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why This Matters Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center mb-4">
            Why This Matters
          </h2>
          <p className="text-xl text-[var(--foreground-muted)] text-center mb-16 max-w-3xl mx-auto">
            This isn&apos;t just a writing tool — it&apos;s a collaborative universe where every accepted story becomes part of the ongoing Everloop saga.
          </p>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🌍</div>
              <h3 className="text-lg font-serif font-semibold mb-2">Living, Growing Universe</h3>
              <p className="text-sm text-[var(--foreground-muted)]">
                Everloop becomes an ever-expanding story world, enriched by every contributing author.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">🧭</div>
              <h3 className="text-lg font-serif font-semibold mb-2">Clear Creative Structure</h3>
              <p className="text-sm text-[var(--foreground-muted)]">
                Writers get a framework to anchor their creativity, not a blank void to fill.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-lg font-serif font-semibold mb-2">AI-Powered Speed</h3>
              <p className="text-sm text-[var(--foreground-muted)]">
                Write faster and better with in-universe guidance that understands the world.
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-lg font-serif font-semibold mb-2">Canonical Recognition</h3>
              <p className="text-sm text-[var(--foreground-muted)]">
                The satisfaction of contributing to a shared canon, not just isolated fanfic.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[var(--background-secondary)] to-[var(--background)] border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold mb-6">
            Ready to Join the Everloop?
          </h2>
          <p className="text-xl text-[var(--foreground-muted)] mb-10">
            Step into a living mythology and leave your mark on the shared canon.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2">
              <PenTool className="w-5 h-5" />
              Start a Story
            </Link>
            <Link href="/explore" className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2">
              <Compass className="w-5 h-5" />
              Explore the World
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-serif">Everloop</span>
            </div>
            <div className="flex gap-8 text-sm text-[var(--foreground-muted)]">
              <Link href="/explore" className="hover:text-white transition-colors">Explore</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/auth/signup" className="hover:text-white transition-colors">Start Writing</Link>
            </div>
            <p className="text-sm text-[var(--foreground-muted)]">
              © 2024 Everloop. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
