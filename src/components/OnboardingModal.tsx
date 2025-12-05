'use client';

import { Sparkles, BookOpen, Shield, CheckCircle } from 'lucide-react';

interface OnboardingModalProps {
  onAccept: () => void;
}

export default function OnboardingModal({ onAccept }: OnboardingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay">
      <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-fade-in">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-serif font-bold mb-2">Welcome to Everloop</h1>
            <p className="text-[var(--foreground-muted)]">
              Before you begin, please understand how this platform works.
            </p>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* What is Everloop */}
            <div className="p-6 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-blue)]/20 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-5 h-5 text-[var(--accent-blue)]" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">What is Everloop?</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    Everloop is an existing fantasy universe with its own rules, history, characters, and lore. 
                    This platform lets you contribute stories to that shared universe, expanding the canon with 
                    new narratives that fit within the established world.
                  </p>
                </div>
              </div>
            </div>

            {/* Shared Canon */}
            <div className="p-6 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-purple)]/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[var(--accent-purple)]" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Shared Canon, Not Personal RP</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    This is not a platform for personal avatars, unrelated fan fiction, or chaotic roleplay. 
                    Stories must connect to the Everloop universe meaningfully and respect the world&apos;s 
                    established mechanics, tone, and history.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Review */}
            <div className="p-6 rounded-lg bg-[var(--background-tertiary)] border border-[var(--border)]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--accent-gold)]/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-[var(--accent-gold)]" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2">AI Canon Review</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    All story submissions go through an AI-powered consistency review. The AI checks your 
                    story against Everloop&apos;s lore, rules, and existing canon. Stories with conflicts must 
                    be revised before they can be approved and added to the shared universe.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rules Summary */}
          <div className="mt-8 p-4 rounded-lg bg-gradient-to-r from-[var(--accent-blue)]/10 to-[var(--accent-purple)]/10 border border-[var(--accent-blue)]/30">
            <h4 className="font-semibold mb-3">By continuing, you agree to:</h4>
            <ul className="space-y-2 text-sm text-[var(--foreground-muted)]">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)] flex-shrink-0 mt-0.5" />
                Write stories that respect Everloop&apos;s established lore and rules
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)] flex-shrink-0 mt-0.5" />
                Connect your contributions meaningfully to the shared universe
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)] flex-shrink-0 mt-0.5" />
                Accept the AI canon review process and revise when conflicts are found
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[var(--success)] flex-shrink-0 mt-0.5" />
                Maintain the mythic, contemplative tone of the Everloop universe
              </li>
            </ul>
          </div>

          {/* Accept Button */}
          <div className="mt-8">
            <button
              onClick={onAccept}
              className="btn-primary w-full text-lg py-4"
            >
              I Accept the Storytelling Rules
            </button>
            <p className="text-xs text-[var(--foreground-muted)] text-center mt-4">
              You can review these guidelines anytime from your dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
