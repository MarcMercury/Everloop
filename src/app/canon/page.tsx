'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Globe, Sparkles, TrendingUp } from 'lucide-react'
import CanonFeed from '@/components/CanonFeed'

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-400">Loading the Weave...</p>
      </div>
    </div>
  )
}

export default function CanonPage() {
  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0a0f1a]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <div className="h-6 w-px bg-gray-800" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                <Globe className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">The Living Weave</h1>
                <p className="text-xs text-gray-500">All contributions to the Everloop universe</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/write"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg transition-colors text-sm"
            >
              <Sparkles className="w-4 h-4" />
              Contribute
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-serif font-bold text-white mb-4">
            The Weave Grows Every Moment
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Every story, character, location, and quest becomes part of the living universe instantly.
            No waiting, no approval queues—just pure creation flowing into the Everloop.
          </p>
        </div>

        {/* Contribution Stats Banner */}
        <div className="mb-8 p-6 bg-gradient-to-br from-green-500/5 to-blue-500/5 border border-green-500/20 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Frictionless Creation</h3>
              <p className="text-sm text-gray-400">
                Create → Validate (instant) → Publish → Part of canon. That's it.
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="p-4 bg-gray-900/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-green-400">&lt;1s</p>
              <p className="text-xs text-gray-500">Validation Time</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-blue-400">99%</p>
              <p className="text-xs text-gray-500">Instant Approval</p>
            </div>
            <div className="p-4 bg-gray-900/50 rounded-xl text-center">
              <p className="text-2xl font-bold text-purple-400">∞</p>
              <p className="text-xs text-gray-500">No Limits</p>
            </div>
          </div>
        </div>

        {/* Canon Feed */}
        <Suspense fallback={<LoadingState />}>
          <CanonFeed showFilters={true} />
        </Suspense>
      </main>
    </div>
  )
}
