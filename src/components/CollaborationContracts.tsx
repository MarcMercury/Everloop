'use client'

import { useState } from 'react'
import { 
  Users, Link2, FileCheck, Clock, CheckCircle2, XCircle,
  Plus, Search, Filter, ChevronRight, Star, Shield, Sparkles,
  BookOpen, User, MapPin, Sword, Diamond, GitBranch
} from 'lucide-react'

interface Contract {
  id: string
  title: string
  description: string
  type: 'character_share' | 'story_branch' | 'location_use' | 'quest_collab' | 'shard_link' | 'canon_merge'
  status: 'pending' | 'active' | 'completed' | 'rejected'
  participants: Participant[]
  terms: string[]
  createdAt: Date
  expiresAt?: Date
}

interface Participant {
  id: string
  name: string
  role: 'initiator' | 'contributor' | 'reviewer'
  approved: boolean
  contribution?: string
}

const CONTRACT_TYPES = {
  character_share: { label: 'Character Share', icon: User, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  story_branch: { label: 'Story Branch', icon: GitBranch, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  location_use: { label: 'Location Use', icon: MapPin, color: 'text-green-400', bg: 'bg-green-500/10' },
  quest_collab: { label: 'Quest Collaboration', icon: Sword, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  shard_link: { label: 'Shard Link', icon: Diamond, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  canon_merge: { label: 'Canon Merge', icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
}

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  active: { label: 'Active', color: 'text-green-400', bg: 'bg-green-500/10' },
  completed: { label: 'Completed', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  rejected: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-500/10' },
}

const SAMPLE_CONTRACTS: Contract[] = [
  {
    id: '1',
    title: 'Elder Mira Appearance in "The Fray Walker"',
    description: 'Permission to include Elder Mira as a supporting character in my story about temporal anomalies.',
    type: 'character_share',
    status: 'active',
    participants: [
      { id: '1', name: 'FounderWriter', role: 'initiator', approved: true, contribution: 'Created Elder Mira' },
      { id: '2', name: 'FrayExplorer', role: 'contributor', approved: true, contribution: 'Writing new story' },
    ],
    terms: [
      'Character personality must remain consistent with canon',
      'No permanent changes to character status',
      'Credit original creator in story notes',
      'Submit for canon review before publishing',
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
  },
  {
    id: '2',
    title: 'Sunken Hollow Quest Chain',
    description: 'Collaborative quest series exploring the mysteries of the Sunken Hollow.',
    type: 'quest_collab',
    status: 'pending',
    participants: [
      { id: '3', name: 'QuestMaster', role: 'initiator', approved: true },
      { id: '4', name: 'LoreKeeper', role: 'contributor', approved: true },
      { id: '5', name: 'WorldBuilder', role: 'contributor', approved: false },
    ],
    terms: [
      'Each contributor designs 2-3 quests',
      'Quests must interconnect logically',
      'Share rewards and recognition equally',
      'Consensus required for major lore additions',
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
  },
  {
    id: '3',
    title: 'Binding Shard Connection',
    description: 'Link my Resonance Shard story arc with the canon Binding Shard mythology.',
    type: 'shard_link',
    status: 'pending',
    participants: [
      { id: '6', name: 'ShardSeeker', role: 'initiator', approved: true },
      { id: '7', name: 'CanonCouncil', role: 'reviewer', approved: false },
    ],
    terms: [
      'Must not contradict existing shard lore',
      'Requires 3 council votes for approval',
      'Can reference but not alter existing shards',
      'Subject to canon consistency review',
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
  },
]

interface CollaborationContractsProps {
  contracts?: Contract[]
  onCreateContract?: () => void
  onViewContract?: (contract: Contract) => void
  onApproveContract?: (contractId: string) => void
  onRejectContract?: (contractId: string) => void
}

export default function CollaborationContracts({
  contracts = SAMPLE_CONTRACTS,
  onCreateContract,
  onViewContract,
  onApproveContract,
  onRejectContract,
}: CollaborationContractsProps) {
  const [filterType, setFilterType] = useState<keyof typeof CONTRACT_TYPES | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<keyof typeof STATUS_CONFIG | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)

  const filteredContracts = contracts.filter(c => {
    if (filterType !== 'all' && c.type !== filterType) return false
    if (filterStatus !== 'all' && c.status !== filterStatus) return false
    if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0f1a]">
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
              <Link2 className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Collaboration Contracts</h2>
              <p className="text-sm text-gray-500">Multi-user story linking agreements</p>
            </div>
          </div>
          
          <button
            onClick={onCreateContract}
            className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Contract
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contracts..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as keyof typeof CONTRACT_TYPES | 'all')}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none"
            >
              <option value="all">All Types</option>
              {Object.entries(CONTRACT_TYPES).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as keyof typeof STATUS_CONFIG | 'all')}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:outline-none"
            >
              <option value="all">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Contract List */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-4">
          {filteredContracts.map((contract) => {
            const typeConfig = CONTRACT_TYPES[contract.type]
            const statusConfig = STATUS_CONFIG[contract.status]
            const TypeIcon = typeConfig.icon
            const pendingApprovals = contract.participants.filter(p => !p.approved).length

            return (
              <div
                key={contract.id}
                onClick={() => {
                  setSelectedContract(contract)
                  onViewContract?.(contract)
                }}
                className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 rounded-lg ${typeConfig.bg} flex items-center justify-center flex-shrink-0`}>
                    <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-white group-hover:text-violet-400 transition-colors truncate">
                        {contract.title}
                      </h3>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{contract.description}</p>

                    {/* Participants */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex -space-x-2">
                        {contract.participants.slice(0, 4).map((p, i) => (
                          <div
                            key={p.id}
                            className={`w-6 h-6 rounded-full border-2 border-gray-900 flex items-center justify-center text-[10px] font-medium ${
                              p.approved ? 'bg-violet-500 text-white' : 'bg-gray-700 text-gray-400'
                            }`}
                            title={`${p.name} (${p.approved ? 'Approved' : 'Pending'})`}
                          >
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {contract.participants.length > 4 && (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-900 bg-gray-800 flex items-center justify-center text-[10px] text-gray-400">
                            +{contract.participants.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {contract.participants.length} participant{contract.participants.length !== 1 ? 's' : ''}
                        {pendingApprovals > 0 && (
                          <span className="text-yellow-400"> · {pendingApprovals} pending</span>
                        )}
                      </span>
                    </div>

                    {/* Terms Preview */}
                    <div className="flex flex-wrap gap-2">
                      {contract.terms.slice(0, 2).map((term, i) => (
                        <span key={i} className="text-[10px] px-2 py-1 bg-gray-800 text-gray-400 rounded-full truncate max-w-[200px]">
                          {term}
                        </span>
                      ))}
                      {contract.terms.length > 2 && (
                        <span className="text-[10px] px-2 py-1 bg-gray-800 text-gray-500 rounded-full">
                          +{contract.terms.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions / Meta */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatDate(contract.createdAt)}
                    </div>
                    
                    {contract.status === 'pending' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onApproveContract?.(contract.id)
                          }}
                          className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onRejectContract?.(contract.id)
                          }}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    
                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                  </div>
                </div>
              </div>
            )
          })}

          {filteredContracts.length === 0 && (
            <div className="text-center py-12">
              <Link2 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">No contracts found</p>
              <button
                onClick={onCreateContract}
                className="mt-4 text-sm text-violet-400 hover:text-violet-300 transition-colors"
              >
                Create your first contract
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t border-gray-800 bg-gray-900/50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-green-400" />
              {contracts.filter(c => c.status === 'active').length} Active
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400" />
              {contracts.filter(c => c.status === 'pending').length} Pending
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-400" />
              {contracts.filter(c => c.status === 'completed').length} Completed
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-violet-400" />
            All contracts are binding within canon
          </div>
        </div>
      </div>
    </div>
  )
}
