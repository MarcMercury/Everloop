'use client'

import { useState } from 'react'
import { 
  Sparkles, CheckCircle2, XCircle, Loader2, 
  Zap, GitBranch, Star, AlertTriangle, RefreshCw,
  ArrowRight, BookOpen, FileText, Send
} from 'lucide-react'

type CanonLane = 'instant' | 'branch' | 'primary'
type PublishStatus = 'idle' | 'validating' | 'publishing' | 'success' | 'error' | 'review'

interface ValidationResult {
  canPublish: boolean
  canonLane: CanonLane
  confidence: number
  suggestions?: Array<{
    type: string
    message: string
  }>
  autoReconciliations?: Array<{
    issue: string
    resolution: string
  }>
  conflicts?: Array<{
    description: string
    severity: string
  }>
}

interface PublishResult {
  success: boolean
  published: boolean
  canonLane?: CanonLane
  canonTier?: string
  message?: string
  contributionId?: string
  error?: string
  status?: string
  conflicts?: any[]
  issues?: string[]
}

interface InstantPublishFlowProps {
  contentType: 'story' | 'character' | 'location' | 'quest' | 'map' | 'creature' | 'lore_entry'
  contentId: string
  title: string
  content: string
  metadata?: Record<string, unknown>
  onSuccess?: (result: PublishResult) => void
  onError?: (error: string) => void
}

const LANE_CONFIG = {
  instant: {
    label: 'Instant Canon',
    icon: Zap,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    description: 'Your creation is now live in the universe!',
  },
  branch: {
    label: 'Branch Canon',
    icon: GitBranch,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    description: 'Connected to existing stories in the Weave.',
  },
  primary: {
    label: 'Primary Canon',
    icon: Star,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    description: 'Submitted for core universe consideration.',
  },
}

export default function InstantPublishFlow({
  contentType,
  contentId,
  title,
  content,
  metadata,
  onSuccess,
  onError,
}: InstantPublishFlowProps) {
  const [status, setStatus] = useState<PublishStatus>('idle')
  const [result, setResult] = useState<PublishResult | null>(null)
  const [validation, setValidation] = useState<ValidationResult | null>(null)

  const handlePublish = async () => {
    setStatus('validating')
    
    try {
      // Call the publish API
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          contentId,
          title,
          content,
          metadata,
        }),
      })

      const data = await response.json()

      if (data.success && data.published) {
        setStatus('success')
        setResult(data)
        setValidation(data.validation)
        onSuccess?.(data)
      } else if (data.status === 'review_needed') {
        setStatus('review')
        setResult(data)
        setValidation(data.validation)
      } else {
        setStatus('error')
        setResult(data)
        onError?.(data.error || data.message || 'Publication failed')
      }
    } catch (error) {
      setStatus('error')
      setResult({ 
        success: false, 
        published: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
      onError?.(error instanceof Error ? error.message : 'Publication failed')
    }
  }

  const renderIdleState = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 p-4 bg-gray-800/50 rounded-xl">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <FileText className="w-5 h-5 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-white">{title}</p>
          <p className="text-xs text-gray-500 capitalize">{contentType} • Ready to publish</p>
        </div>
      </div>

      <div className="p-4 bg-gradient-to-br from-green-500/5 to-blue-500/5 border border-green-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-green-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">Instant Publishing</p>
            <p className="text-xs text-gray-400 mt-1">
              Your creation will be validated automatically and published to the Everloop universe immediately.
              No waiting, no approval queues.
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={handlePublish}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-medium rounded-xl transition-all"
      >
        <Send className="w-5 h-5" />
        Publish to Everloop
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  )

  const renderValidatingState = () => (
    <div className="text-center py-8">
      <div className="relative w-16 h-16 mx-auto mb-4">
        <div className="absolute inset-0 rounded-full bg-blue-500/20 animate-ping" />
        <div className="relative w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      </div>
      <p className="text-white font-medium">Weaving into the universe...</p>
      <p className="text-sm text-gray-400 mt-1">Validating world consistency</p>
    </div>
  )

  const renderSuccessState = () => {
    if (!result?.canonLane) return null
    const laneConfig = LANE_CONFIG[result.canonLane]
    const LaneIcon = laneConfig.icon

    return (
      <div className="space-y-4">
        <div className="text-center py-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${laneConfig.bg} flex items-center justify-center`}>
            <CheckCircle2 className={`w-8 h-8 ${laneConfig.color}`} />
          </div>
          <h3 className="text-xl font-semibold text-white">Published!</h3>
          <p className="text-sm text-gray-400 mt-1">{result.message}</p>
        </div>

        <div className={`p-4 rounded-xl ${laneConfig.bg} border ${laneConfig.border}`}>
          <div className="flex items-center gap-3">
            <LaneIcon className={`w-6 h-6 ${laneConfig.color}`} />
            <div>
              <p className={`text-sm font-medium ${laneConfig.color}`}>{laneConfig.label}</p>
              <p className="text-xs text-gray-400">{laneConfig.description}</p>
            </div>
          </div>
        </div>

        {validation?.suggestions && validation.suggestions.length > 0 && (
          <div className="p-4 bg-gray-800/50 rounded-xl">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Suggestions</p>
            <ul className="space-y-2">
              {validation.suggestions.map((suggestion, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                  {suggestion.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {validation?.autoReconciliations && validation.autoReconciliations.length > 0 && (
          <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-xs font-medium text-blue-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              Auto-Reconciled
            </p>
            <ul className="space-y-2">
              {validation.autoReconciliations.map((rec, i) => (
                <li key={i} className="text-xs text-gray-400">
                  <span className="text-gray-500">{rec.issue}</span>
                  <span className="mx-2">→</span>
                  <span className="text-blue-300">{rec.resolution}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => setStatus('idle')}
          className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Publish Another
        </button>
      </div>
    )
  }

  const renderReviewState = () => (
    <div className="space-y-4">
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-yellow-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Queued for Review</h3>
        <p className="text-sm text-gray-400 mt-1">{result?.message}</p>
      </div>

      {result?.conflicts && result.conflicts.length > 0 && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-xs font-medium text-yellow-400 uppercase tracking-wide mb-2">
            Potential Conflicts
          </p>
          <ul className="space-y-2">
            {result.conflicts.map((conflict, i) => (
              <li key={i} className="text-sm text-gray-300">
                {conflict.description}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        A curator will review your submission soon. This usually takes less than 24 hours.
      </p>
    </div>
  )

  const renderErrorState = () => (
    <div className="space-y-4">
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-xl font-semibold text-white">Unable to Publish</h3>
        <p className="text-sm text-gray-400 mt-1">{result?.error || result?.message}</p>
      </div>

      {result?.issues && result.issues.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-xs font-medium text-red-400 uppercase tracking-wide mb-2">Issues</p>
          <ul className="space-y-2">
            {result.issues.map((issue, i) => (
              <li key={i} className="text-sm text-gray-300">{issue}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={() => setStatus('idle')}
        className="w-full px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
      >
        Try Again
      </button>
    </div>
  )

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
      {status === 'idle' && renderIdleState()}
      {status === 'validating' && renderValidatingState()}
      {status === 'success' && renderSuccessState()}
      {status === 'review' && renderReviewState()}
      {status === 'error' && renderErrorState()}
    </div>
  )
}
