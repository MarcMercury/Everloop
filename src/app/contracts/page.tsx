'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Plus, Link2 } from 'lucide-react'
import CollaborationContracts from '@/components/CollaborationContracts'

function LoadingState() {
  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        <p className="text-gray-400">Loading Contracts...</p>
      </div>
    </div>
  )
}

export default function ContractsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)

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
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <Link2 className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">Collaboration Contracts</h1>
              <p className="text-xs text-gray-500">Manage story agreements</p>
            </div>
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
            href="/desk"
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Story Desk
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Suspense fallback={<LoadingState />}>
          <CollaborationContracts 
            onCreateContract={() => setShowCreateModal(true)}
            onViewContract={(contract) => {
              console.log('Viewing contract:', contract)
            }}
            onApproveContract={(id) => {
              console.log('Approving contract:', id)
            }}
            onRejectContract={(id) => {
              console.log('Rejecting contract:', id)
            }}
          />
        </Suspense>
      </main>
    </div>
  )
}
