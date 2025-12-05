'use client'

import { useState } from 'react'
import { 
  User, MapPin, Bug, Diamond, Users, Wand2, ScrollText, Calendar,
  Layers, Home, Church, Sparkles, Plus, Search, Filter, Grid, List,
  Eye, Edit2, Trash2, ChevronRight
} from 'lucide-react'
import type { LoreEntryType, LoreEntry, MapVisibility, MapStatus } from '@/types/database'

interface LoreEntryFormData {
  name: string
  entry_type: LoreEntryType
  summary: string
  content: string
  tags: string[]
  visibility: MapVisibility
}

const ENTRY_TYPE_CONFIG: Record<LoreEntryType, { icon: typeof User; color: string; label: string }> = {
  character: { icon: User, color: '#3b82f6', label: 'Character' },
  location: { icon: MapPin, color: '#22c55e', label: 'Location' },
  creature: { icon: Bug, color: '#ef4444', label: 'Creature' },
  shard: { icon: Diamond, color: '#ec4899', label: 'Shard' },
  faction: { icon: Users, color: '#f59e0b', label: 'Faction' },
  artifact: { icon: Wand2, color: '#8b5cf6', label: 'Artifact' },
  mythology: { icon: ScrollText, color: '#6366f1', label: 'Mythology' },
  event: { icon: Calendar, color: '#06b6d4', label: 'Event' },
  species: { icon: Layers, color: '#14b8a6', label: 'Species' },
  house: { icon: Home, color: '#f97316', label: 'House' },
  religion: { icon: Church, color: '#a855f7', label: 'Religion' },
  other: { icon: Sparkles, color: '#6b7280', label: 'Other' },
}

interface LoreForgeProps {
  entries?: LoreEntry[]
  onCreateEntry?: (data: LoreEntryFormData) => void
  onEditEntry?: (id: string, data: Partial<LoreEntryFormData>) => void
  onDeleteEntry?: (id: string) => void
  onViewEntry?: (id: string) => void
}

export default function LoreForge({
  entries = [],
  onCreateEntry,
  onEditEntry,
  onDeleteEntry,
  onViewEntry,
}: LoreForgeProps) {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selectedType, setSelectedType] = useState<LoreEntryType | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<LoreEntry | null>(null)
  
  const [formData, setFormData] = useState<LoreEntryFormData>({
    name: '',
    entry_type: 'character',
    summary: '',
    content: '',
    tags: [],
    visibility: 'private',
  })
  const [tagInput, setTagInput] = useState('')

  const filteredEntries = entries.filter(entry => {
    const matchesType = selectedType === 'all' || entry.entry_type === selectedType
    const matchesSearch = entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const handleCreateEntry = () => {
    onCreateEntry?.(formData)
    setShowCreateModal(false)
    setFormData({
      name: '',
      entry_type: 'character',
      summary: '',
      content: '',
      tags: [],
      visibility: 'private',
    })
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  const getStatusColor = (status: MapStatus) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-900/30'
      case 'pending_review': return 'text-yellow-400 bg-yellow-900/30'
      case 'rejected': return 'text-red-400 bg-red-900/30'
      default: return 'text-gray-400 bg-gray-900/30'
    }
  }

  return (
    <div className="h-full flex flex-col bg-charcoal">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">LoreForge</h1>
            <p className="text-gray-400">The Canon Glossary & Character Vault</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              placeholder="Search lore entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-navy border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedType === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-navy text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            {(Object.entries(ENTRY_TYPE_CONFIG) as [LoreEntryType, typeof ENTRY_TYPE_CONFIG[LoreEntryType]][]).map(([type, config]) => {
              const Icon = config.icon
              return (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
                    selectedType === type 
                      ? 'text-white' 
                      : 'bg-navy text-gray-400 hover:text-white'
                  }`}
                  style={selectedType === type ? { backgroundColor: config.color } : {}}
                >
                  <Icon className="w-4 h-4" />
                  {config.label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-1 border border-gray-700 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-gray-700' : ''}`}
            >
              <Grid className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-gray-700' : ''}`}
            >
              <List className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <ScrollText className="w-16 h-16 text-gray-600 mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">No lore entries yet</h3>
            <p className="text-gray-500 mb-6">Start building your universe encyclopedia</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Entry
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredEntries.map(entry => {
              const config = ENTRY_TYPE_CONFIG[entry.entry_type]
              const Icon = config.icon
              return (
                <div
                  key={entry.id}
                  className="bg-navy rounded-xl border border-gray-800 overflow-hidden hover:border-gray-600 transition-colors group cursor-pointer"
                  onClick={() => onViewEntry?.(entry.id)}
                >
                  {/* Header */}
                  <div 
                    className="h-24 relative"
                    style={{ backgroundColor: config.color + '20' }}
                  >
                    <Icon 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 opacity-30"
                      style={{ color: config.color }}
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1">
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>
                    <div 
                      className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-xs text-white"
                      style={{ backgroundColor: config.color }}
                    >
                      {config.label}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1 truncate">{entry.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                      {entry.summary || 'No summary'}
                    </p>

                    {/* Tags */}
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {entry.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-400">
                            {tag}
                          </span>
                        ))}
                        {entry.tags.length > 3 && (
                          <span className="px-2 py-0.5 bg-gray-800 rounded text-xs text-gray-500">
                            +{entry.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* AI Tags */}
                    {entry.ai_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.ai_tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-purple-900/30 border border-purple-700/50 rounded text-xs text-purple-400">
                            <Sparkles className="w-3 h-3 inline mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onViewEntry?.(entry.id) }}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedEntry(entry) }}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteEntry?.(entry.id) }}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEntries.map(entry => {
              const config = ENTRY_TYPE_CONFIG[entry.entry_type]
              const Icon = config.icon
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-4 p-4 bg-navy rounded-lg border border-gray-800 hover:border-gray-600 transition-colors cursor-pointer group"
                  onClick={() => onViewEntry?.(entry.id)}
                >
                  <div 
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: config.color + '20' }}
                  >
                    <Icon className="w-6 h-6" style={{ color: config.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{entry.name}</h3>
                      <span 
                        className="px-2 py-0.5 rounded text-xs text-white"
                        style={{ backgroundColor: config.color }}
                      >
                        {config.label}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 truncate">
                      {entry.summary || 'No summary'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedEntry(entry) }}
                      className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteEntry?.(entry.id) }}
                      className="p-2 text-gray-400 hover:text-red-400 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-navy rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h3 className="text-xl font-bold text-white">Create Lore Entry</h3>
            </div>

            <div className="p-6 space-y-6">
              {/* Entry Type Grid */}
              <div>
                <label className="block text-sm text-gray-400 mb-3">Entry Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(Object.entries(ENTRY_TYPE_CONFIG) as [LoreEntryType, typeof ENTRY_TYPE_CONFIG[LoreEntryType]][]).map(([type, config]) => {
                    const Icon = config.icon
                    return (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, entry_type: type })}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-colors ${
                          formData.entry_type === type 
                            ? 'border-2' 
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                        style={formData.entry_type === type ? { 
                          borderColor: config.color,
                          backgroundColor: config.color + '15'
                        } : {}}
                      >
                        <Icon 
                          className="w-6 h-6" 
                          style={{ color: formData.entry_type === type ? config.color : '#9ca3af' }} 
                        />
                        <span className={`text-xs ${formData.entry_type === type ? 'text-white' : 'text-gray-400'}`}>
                          {config.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter name..."
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Summary</label>
                <textarea
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-4 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder="Brief summary..."
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Description</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={6}
                  placeholder="Detailed description..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded text-sm text-gray-300">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-gray-500 hover:text-white">
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 px-4 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add tag..."
                  />
                  <button
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Visibility</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as MapVisibility })}
                  className="w-full px-4 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="private">Private Sandbox</option>
                  <option value="branch_canon">Branch Canon</option>
                  <option value="public_canon">Public Canon</option>
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEntry}
                disabled={!formData.name}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
              >
                Create Entry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
