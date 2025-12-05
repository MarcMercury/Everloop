'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, BookOpen, User, MapPin, Sword, Diamond, 
  GitBranch, Clock, Eye, Link2, ChevronRight, Filter,
  Zap, Star, TrendingUp, RefreshCw, FileText, Globe
} from 'lucide-react'

interface Contribution {
  id: string
  content_type: string
  content_id: string
  creator_id: string
  title: string
  summary: string
  contribution_type: string
  canon_lane: 'instant' | 'branch' | 'primary'
  canon_tier: string
  tags: string[]
  weave_connections: any[]
  view_count: number
  reference_count: number
  published_at: string
  is_featured: boolean
  profiles?: {
    display_name: string
    avatar_url?: string
  }
}

interface CanonFeedProps {
  initialContributions?: Contribution[]
  creatorId?: string
  showFilters?: boolean
}

const CONTENT_ICONS: Record<string, typeof BookOpen> = {
  story: FileText,
  character: User,
  location: MapPin,
  quest: Sword,
  map: Globe,
  creature: Diamond,
  lore_entry: BookOpen,
}

const LANE_CONFIG = {
  instant: {
    label: 'Instant Canon',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    description: 'Auto-accepted into the Weave',
  },
  branch: {
    label: 'Branch Canon',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    description: 'Connected to existing stories',
  },
  primary: {
    label: 'Primary Canon',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    description: 'Core universe content',
  },
}

export default function CanonFeed({ 
  initialContributions = [], 
  creatorId,
  showFilters = true 
}: CanonFeedProps) {
  const [contributions, setContributions] = useState<Contribution[]>(initialContributions)
  const [loading, setLoading] = useState(initialContributions.length === 0)
  const [filter, setFilter] = useState<{
    lane?: 'instant' | 'branch' | 'primary'
    type?: string
  }>({})
  const [stats, setStats] = useState<{
    total: number
    instant: number
    branch: number
    primary: number
  }>({ total: 0, instant: 0, branch: 0, primary: 0 })

  useEffect(() => {
    loadContributions()
  }, [filter, creatorId])

  const loadContributions = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter.lane) params.set('lane', filter.lane)
      if (filter.type) params.set('type', filter.type)
      if (creatorId) params.set('creator', creatorId)
      params.set('limit', '50')

      const response = await fetch(`/api/canon/contributions?${params}`)
      const data = await response.json()
      
      if (data.contributions) {
        setContributions(data.contributions)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load contributions:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatRelativeTime = (date: string) => {
    const now = new Date()
    const then = new Date(date)
    const diff = now.getTime() - then.getTime()
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return then.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-center">
          <div className="text-2xl font-bold text-white">{stats.total}</div>
          <div className="text-xs text-gray-500">Total Contributions</div>
        </div>
        <div className={`p-4 rounded-xl text-center ${LANE_CONFIG.instant.bg} ${LANE_CONFIG.instant.border} border`}>
          <div className={`text-2xl font-bold ${LANE_CONFIG.instant.color}`}>{stats.instant}</div>
          <div className="text-xs text-gray-500">Instant Canon</div>
        </div>
        <div className={`p-4 rounded-xl text-center ${LANE_CONFIG.branch.bg} ${LANE_CONFIG.branch.border} border`}>
          <div className={`text-2xl font-bold ${LANE_CONFIG.branch.color}`}>{stats.branch}</div>
          <div className="text-xs text-gray-500">Branch Canon</div>
        </div>
        <div className={`p-4 rounded-xl text-center ${LANE_CONFIG.primary.bg} ${LANE_CONFIG.primary.border} border`}>
          <div className={`text-2xl font-bold ${LANE_CONFIG.primary.color}`}>{stats.primary}</div>
          <div className="text-xs text-gray-500">Primary Canon</div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">Filter:</span>
          </div>
          
          {/* Lane filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter(f => ({ ...f, lane: undefined }))}
              className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                !filter.lane ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              All Lanes
            </button>
            {Object.entries(LANE_CONFIG).map(([lane, config]) => (
              <button
                key={lane}
                onClick={() => setFilter(f => ({ ...f, lane: lane as 'instant' | 'branch' | 'primary' }))}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
                  filter.lane === lane 
                    ? `${config.bg} ${config.color}` 
                    : 'text-gray-400 hover:bg-gray-800'
                }`}
              >
                {config.label}
              </button>
            ))}
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-2 ml-4">
            {Object.entries(CONTENT_ICONS).slice(0, 4).map(([type, Icon]) => (
              <button
                key={type}
                onClick={() => setFilter(f => ({ ...f, type: f.type === type ? undefined : type }))}
                className={`p-2 rounded-lg transition-colors ${
                  filter.type === type 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'text-gray-500 hover:bg-gray-800 hover:text-gray-300'
                }`}
                title={type}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          <button
            onClick={loadContributions}
            className="ml-auto p-2 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      )}

      {/* Contributions List */}
      <div className="space-y-3">
        {contributions.map((contribution) => {
          const Icon = CONTENT_ICONS[contribution.content_type] || FileText
          const laneConfig = LANE_CONFIG[contribution.canon_lane]

          return (
            <div
              key={contribution.id}
              className={`p-4 bg-gray-900 border rounded-xl hover:border-gray-700 transition-all group ${
                contribution.is_featured ? 'border-yellow-500/30' : 'border-gray-800'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-lg ${laneConfig.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${laneConfig.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] uppercase tracking-wide ${laneConfig.color}`}>
                      {laneConfig.label}
                    </span>
                    {contribution.is_featured && (
                      <span className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                        <Star className="w-2.5 h-2.5" />
                        Featured
                      </span>
                    )}
                    <span className="text-[10px] text-gray-600 capitalize">{contribution.content_type}</span>
                  </div>

                  <h3 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                    {contribution.title}
                  </h3>

                  {contribution.summary && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {contribution.summary}
                    </p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-[10px] text-gray-600">
                    {contribution.profiles && (
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {contribution.profiles.display_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(contribution.published_at)}
                    </span>
                    {contribution.view_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {contribution.view_count}
                      </span>
                    )}
                    {contribution.reference_count > 0 && (
                      <span className="flex items-center gap-1">
                        <Link2 className="w-3 h-3" />
                        {contribution.reference_count} refs
                      </span>
                    )}
                  </div>

                  {contribution.tags && contribution.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {contribution.tags.slice(0, 5).map((tag, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Arrow */}
                <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
              </div>
            </div>
          )
        })}

        {contributions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">No contributions yet</p>
            <p className="text-xs text-gray-600 mt-1">Be the first to add to the Weave!</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 text-gray-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Loading contributions...</p>
          </div>
        )}
      </div>
    </div>
  )
}
