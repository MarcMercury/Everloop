'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, Search, GitBranch } from 'lucide-react'
import StoryPathTracker from '@/components/StoryPathTracker'

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-400">Loading Story Paths...</p>
      </div>
    </div>
  )
}

export default function PathsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="h-6 w-px bg-gray-800" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <GitBranch className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Story Path Tracker</h1>
              <p className="text-xs text-gray-500">Visualize canon connections</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search stories, characters..."
              className="pl-10 pr-4 py-2 w-64 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          
          {/* Actions */}
          <Link
            href="/simulator"
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Fray Simulator
          </Link>
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Add Connection
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Suspense fallback={<LoadingState />}>
          <StoryPathTracker 
            onNodeClick={(node) => {
              console.log('Selected node:', node)
            }}
            onExport={() => {
              console.log('Exporting story path map...')
            }}
          />
        </Suspense>
      </main>
    </div>
  )
}
