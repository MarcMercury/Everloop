'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import FrayVisualizer from '@/components/FrayVisualizer'

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-400">Loading Fray Simulator...</p>
      </div>
    </div>
  )
}

export default function SimulatorPage() {
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
          <div>
            <h1 className="text-lg font-semibold text-white">Fray & Fold Simulator</h1>
            <p className="text-xs text-gray-500">Visualize temporal instabilities</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href="/paths"
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Story Paths
          </Link>
          <Link
            href="/write"
            className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            Open Writer
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Suspense fallback={<LoadingState />}>
          <FrayVisualizer 
            onExportSequence={(sequence) => {
              console.log('Exporting sequence:', sequence)
              // Navigate to write page with draft data
            }}
          />
        </Suspense>
      </main>
    </div>
  )
}
