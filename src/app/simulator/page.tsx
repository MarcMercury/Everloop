'use client';

import Link from 'next/link';
import { 
  ArrowLeft, 
  Construction, 
  Sparkles,
  BookOpen,
  Map,
  Clock,
} from 'lucide-react';

export default function SimulatorPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] flex flex-col">
      {/* Sub-header */}
      <div className="bg-[var(--background-secondary)] border-b border-[var(--border)]">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 text-[var(--foreground-muted)] hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <div className="text-sm text-[var(--foreground-muted)]">Timeline Tools</div>
          </div>
        </div>
      </div>

      {/* Main Content - Coming Soon */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--accent-blue)]/20 to-[var(--accent-purple)]/20 flex items-center justify-center mx-auto mb-6">
            <Construction className="w-10 h-10 text-[var(--accent-gold)]" />
          </div>
          
          <h1 className="text-3xl font-serif font-bold mb-4">Timeline Visualizer</h1>
          <p className="text-lg text-[var(--foreground-muted)] mb-8">
            The Timeline Visualizer is being rebuilt with new features. Soon you'll be able to 
            explore the chronology of Everloop events and see how stories interconnect through time.
          </p>

          {/* Feature Preview */}
          <div className="grid gap-4 mb-8">
            <div className="flex items-center gap-4 p-4 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] text-left">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Temporal Navigation</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Scroll through time periods and see events unfold
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] text-left">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Story Connections</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  See how narratives branch and converge across the canon
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] text-left">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                <Map className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="font-medium text-white">Geographic Timeline</h3>
                <p className="text-sm text-[var(--foreground-muted)]">
                  Track events across locations and regions
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/explore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent-gold)] text-black font-medium rounded-lg hover:bg-[var(--accent-gold)]/90 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Explore Stories
            </Link>
            <Link
              href="/lore"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[var(--background-secondary)] border border-[var(--border)] text-white font-medium rounded-lg hover:bg-[var(--background-tertiary)] transition-colors"
            >
              Browse Lore
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
