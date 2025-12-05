'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { 
  ArrowLeft, Plus, Search, Filter, 
  ScrollText, Sparkles, Diamond, Users, MapPin, Bug,
  Eye, Tag, Calendar, ChevronRight
} from 'lucide-react'

// Lore entry from the actual database schema
interface LoreEntryDB {
  id: string
  title: string
  content: string | null
  category: string
  tags: string[] | null
  is_canon: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

const CATEGORY_CONFIG: Record<string, { icon: typeof ScrollText; color: string; label: string }> = {
  phenomena: { icon: Sparkles, color: '#ec4899', label: 'Phenomena' },
  abilities: { icon: Diamond, color: '#8b5cf6', label: 'Abilities' },
  cosmology: { icon: ScrollText, color: '#6366f1', label: 'Cosmology' },
  beings: { icon: Bug, color: '#ef4444', label: 'Beings' },
  artifacts: { icon: Diamond, color: '#f59e0b', label: 'Artifacts' },
  factions: { icon: Users, color: '#22c55e', label: 'Factions' },
  creatures: { icon: Bug, color: '#14b8a6', label: 'Creatures' },
  puzzles: { icon: ScrollText, color: '#06b6d4', label: 'Puzzles' },
  social: { icon: Users, color: '#f97316', label: 'Social' },
  customs: { icon: ScrollText, color: '#a855f7', label: 'Customs' },
  characters: { icon: Users, color: '#3b82f6', label: 'Characters' },
  general: { icon: ScrollText, color: '#6b7280', label: 'General' },
}

export default function LoreForgePageClient() {
  const [entries, setEntries] = useState<LoreEntryDB[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all')
  const [showCanonOnly, setShowCanonOnly] = useState(true)
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchEntries()
  }, [showCanonOnly])

  const fetchEntries = async () => {
    let query = supabase
      .from('lore_entries')
      .select('*')
      .order('category')
      .order('title')

    if (showCanonOnly) {
      query = query.eq('is_canon', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching lore entries:', error)
    }
    if (data) {
      setEntries(data as LoreEntryDB[])
    }
    setLoading(false)
  }

  const filteredEntries = entries.filter(entry => {
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory
    const matchesSearch = 
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  // Group entries by category for display
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    const category = entry.category || 'general'
    if (!acc[category]) acc[category] = []
    acc[category].push(entry)
    return acc
  }, {} as Record<string, LoreEntryDB[]>)

  const getCategoryConfig = (category: string) => {
    return CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--background-light)] border-b border-[var(--gold)]/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/dashboard" 
              className="text-[var(--foreground-muted)] hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold font-serif text-white flex items-center gap-2">
                <ScrollText className="w-6 h-6 text-[var(--gold)]" />
                LoreForge
              </h1>
              <p className="text-sm text-[var(--foreground-muted)]">Canon Lore & World Encyclopedia</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/characters"
              className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors"
            >
              Characters
            </Link>
            <Link
              href="/explore"
              className="text-sm text-[var(--foreground-muted)] hover:text-white transition-colors"
            >
              Stories
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--foreground-muted)]" />
            <input
              type="text"
              placeholder="Search lore entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--gold)]"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === 'all' 
                  ? 'bg-[var(--gold)] text-black font-medium' 
                  : 'bg-[var(--background-secondary)] text-gray-400 hover:text-white'
              }`}
            >
              All ({entries.length})
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([cat, config]) => {
              const count = entries.filter(e => e.category === cat).length
              if (count === 0) return null
              const Icon = config.icon
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedCategory === cat 
                      ? 'bg-[var(--gold)] text-black font-medium' 
                      : 'bg-[var(--background-secondary)] text-gray-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {config.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Canon Toggle */}
        <div className="flex items-center gap-2 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showCanonOnly}
              onChange={(e) => setShowCanonOnly(e.target.checked)}
              className="w-4 h-4 rounded border-gray-600 text-[var(--gold)] focus:ring-[var(--gold)]"
            />
            <span className="text-sm text-[var(--foreground-muted)]">Show Canon Only</span>
          </label>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse text-[var(--gold)]">
              <Sparkles className="w-8 h-8" />
            </div>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center py-20">
            <ScrollText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Lore Entries Found</h3>
            <p className="text-[var(--foreground-muted)]">
              {searchQuery ? 'Try a different search term.' : 'No lore entries in the database yet.'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([category, categoryEntries]) => {
              const config = getCategoryConfig(category)
              const Icon = config.icon
              return (
                <div key={category}>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                    <h2 className="text-lg font-semibold text-white">{config.label}</h2>
                    <span className="text-sm text-gray-500">({categoryEntries.length})</span>
                  </div>
                  <div className="grid gap-4">
                    {categoryEntries.map(entry => (
                      <div
                        key={entry.id}
                        className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-lg overflow-hidden hover:border-[var(--gold)]/30 transition-colors"
                      >
                        <button
                          onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                          className="w-full p-4 text-left flex items-start justify-between gap-4"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white">{entry.title}</h3>
                              {entry.is_canon && (
                                <span className="px-2 py-0.5 text-xs bg-[var(--gold)]/20 text-[var(--gold)] rounded">
                                  Canon
                                </span>
                              )}
                            </div>
                            {entry.tags && entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {entry.tags.slice(0, 5).map(tag => (
                                  <span
                                    key={tag}
                                    className="px-2 py-0.5 text-xs bg-[var(--background)] text-gray-400 rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                                {entry.tags.length > 5 && (
                                  <span className="text-xs text-gray-500">+{entry.tags.length - 5} more</span>
                                )}
                              </div>
                            )}
                          </div>
                          <ChevronRight 
                            className={`w-5 h-5 text-gray-500 transition-transform ${
                              expandedEntry === entry.id ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        {expandedEntry === entry.id && entry.content && (
                          <div className="px-4 pb-4 border-t border-[var(--border)] pt-4">
                            <p className="text-[var(--foreground-muted)] whitespace-pre-wrap leading-relaxed">
                              {entry.content}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
