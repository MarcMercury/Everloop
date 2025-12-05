'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  Handle,
  Position,
  MarkerType,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { 
  Play, MessageSquare, GitBranch, Puzzle, Swords, Gift, Flag,
  Plus, Trash2, Save, Eye, Settings, Users, Sparkles
} from 'lucide-react'
import type { QuestNodeType, QuestType, QuestDifficulty } from '@/types/database'

interface QuestNodeData extends Record<string, unknown> {
  label: string
  nodeType: QuestNodeType
  content: string
  properties: Record<string, unknown>
}

const NODE_CONFIGS: Record<QuestNodeType, { icon: typeof Play; color: string; label: string }> = {
  start: { icon: Play, color: '#22c55e', label: 'Start' },
  narrative: { icon: MessageSquare, color: '#3b82f6', label: 'Narrative' },
  choice: { icon: GitBranch, color: '#f59e0b', label: 'Choice' },
  puzzle: { icon: Puzzle, color: '#8b5cf6', label: 'Puzzle' },
  combat: { icon: Swords, color: '#ef4444', label: 'Combat' },
  reward: { icon: Gift, color: '#ec4899', label: 'Reward' },
  ending: { icon: Flag, color: '#6366f1', label: 'Ending' },
}

// Custom Node Component
function QuestNode({ data, selected }: NodeProps) {
  const nodeData = data as QuestNodeData
  const config = NODE_CONFIGS[nodeData.nodeType]
  const Icon = config.icon

  return (
    <div 
      className={`px-4 py-3 rounded-lg border-2 min-w-[180px] transition-all ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-charcoal' : ''
      }`}
      style={{ 
        backgroundColor: '#1a1f2e',
        borderColor: config.color,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-gray-400" />
      
      <div className="flex items-center gap-2 mb-2">
        <div 
          className="p-1.5 rounded"
          style={{ backgroundColor: config.color + '30' }}
        >
          <Icon className="w-4 h-4" style={{ color: config.color }} />
        </div>
        <span className="text-xs font-medium text-gray-400">{config.label}</span>
      </div>
      
      <p className="text-sm text-white font-medium truncate">{nodeData.label}</p>
      
      {nodeData.content && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2">{nodeData.content}</p>
      )}

      <Handle type="source" position={Position.Bottom} className="!bg-gray-400" />
    </div>
  )
}

const nodeTypes = {
  questNode: QuestNode,
}

interface QuestBuilderProps {
  questId?: string
  initialNodes?: Node<QuestNodeData>[]
  initialEdges?: Edge[]
  initialQuest?: {
    title: string
    description: string
    questType: QuestType
    difficulty: QuestDifficulty
  }
  onSave?: (nodes: Node<QuestNodeData>[], edges: Edge[], quest: {
    title: string
    description: string
    questType: QuestType
    difficulty: QuestDifficulty
  }) => void
  readOnly?: boolean
}

export default function QuestBuilder({
  questId,
  initialNodes = [],
  initialEdges = [],
  initialQuest,
  onSave,
  readOnly = false
}: QuestBuilderProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes.length > 0 ? initialNodes : [
      {
        id: 'start-1',
        type: 'questNode',
        position: { x: 250, y: 50 },
        data: { 
          label: 'Quest Begins', 
          nodeType: 'start' as QuestNodeType, 
          content: 'The adventure starts here...',
          properties: {}
        },
      },
    ]
  )
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<Node<QuestNodeData> | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showNPCs, setShowNPCs] = useState(false)
  
  const [quest, setQuest] = useState({
    title: initialQuest?.title || 'Untitled Quest',
    description: initialQuest?.description || '',
    questType: initialQuest?.questType || 'lore' as QuestType,
    difficulty: initialQuest?.difficulty || 'normal' as QuestDifficulty,
  })

  const onConnect = useCallback(
    (params: Connection) => {
      if (readOnly) return
      setEdges((eds) => addEdge({
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6b7280' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
        label: 'Continue',
        labelStyle: { fill: '#9ca3af', fontSize: 12 },
        labelBgStyle: { fill: '#1a1f2e', fillOpacity: 0.8 },
      }, eds))
    },
    [setEdges, readOnly]
  )

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node as Node<QuestNodeData>)
  }, [])

  const addNode = (type: QuestNodeType) => {
    if (readOnly) return
    const config = NODE_CONFIGS[type]
    const newNode: Node<QuestNodeData> = {
      id: `${type}-${Date.now()}`,
      type: 'questNode',
      position: { x: 250 + Math.random() * 100, y: 150 + nodes.length * 80 },
      data: {
        label: `New ${config.label}`,
        nodeType: type,
        content: '',
        properties: {},
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const deleteNode = (nodeId: string) => {
    if (readOnly) return
    setNodes((nds) => nds.filter((n) => n.id !== nodeId))
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId))
    setSelectedNode(null)
  }

  const updateNodeData = (nodeId: string, updates: Partial<QuestNodeData>) => {
    if (readOnly) return
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, ...updates } }
          : n
      )
    )
    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => prev ? { ...prev, data: { ...prev.data, ...updates } } : null)
    }
  }

  const handleSave = () => {
    onSave?.(nodes, edges, quest)
  }

  return (
    <div className="h-full flex bg-charcoal">
      {/* Left Sidebar - Node Palette */}
      <div className="w-64 bg-navy border-r border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Quest Nodes</h2>
          <p className="text-xs text-gray-400 mt-1">Drag or click to add</p>
        </div>

        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {(Object.entries(NODE_CONFIGS) as [QuestNodeType, typeof NODE_CONFIGS[QuestNodeType]][]).map(([type, config]) => {
            const Icon = config.icon
            return (
              <button
                key={type}
                onClick={() => addNode(type)}
                disabled={readOnly}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors hover:bg-charcoal disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ borderLeft: `3px solid ${config.color}` }}
              >
                <div 
                  className="p-1.5 rounded"
                  style={{ backgroundColor: config.color + '20' }}
                >
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>
                <span className="text-sm text-gray-300">{config.label}</span>
              </button>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-gray-700 space-y-2">
          <button 
            onClick={() => setShowNPCs(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-purple-900/30 hover:bg-purple-900/50 rounded-lg transition-colors"
          >
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300">Manage NPCs</span>
          </button>
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">Quest Settings</span>
          </button>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={readOnly ? undefined : onNodesChange}
          onEdgesChange={readOnly ? undefined : onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="bg-charcoal"
          nodesDraggable={!readOnly}
          nodesConnectable={!readOnly}
          elementsSelectable={!readOnly}
        >
          <Controls className="!bg-navy !border-gray-700" />
          <Background color="#374151" gap={20} />
        </ReactFlow>

        {/* Top Bar */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={quest.title}
              onChange={(e) => setQuest({ ...quest, title: e.target.value })}
              className="px-3 py-2 bg-navy border border-gray-700 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Quest Title"
              disabled={readOnly}
            />
            <select
              value={quest.questType}
              onChange={(e) => setQuest({ ...quest, questType: e.target.value as QuestType })}
              className="px-3 py-2 bg-navy border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={readOnly}
            >
              <option value="lore">Lore Quest</option>
              <option value="mystery">Mystery</option>
              <option value="puzzle">Puzzle</option>
              <option value="combat">Combat</option>
              <option value="exploration">Exploration</option>
              <option value="drift_sequence">Drift Sequence</option>
            </select>
            <select
              value={quest.difficulty}
              onChange={(e) => setQuest({ ...quest, difficulty: e.target.value as QuestDifficulty })}
              className="px-3 py-2 bg-navy border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={readOnly}
            >
              <option value="easy">Easy</option>
              <option value="normal">Normal</option>
              <option value="hard">Hard</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 bg-navy border border-gray-700 rounded-lg hover:bg-gray-700 transition-colors">
              <Eye className="w-5 h-5 text-gray-400" />
            </button>
            {!readOnly && (
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Quest
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Node Properties */}
      <div className="w-80 bg-navy border-l border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">
            {selectedNode ? 'Node Properties' : 'Quest Overview'}
          </h2>
        </div>

        {selectedNode ? (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            {/* Node Type Badge */}
            <div className="flex items-center justify-between">
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
                style={{ 
                  backgroundColor: NODE_CONFIGS[selectedNode.data.nodeType].color + '20',
                  color: NODE_CONFIGS[selectedNode.data.nodeType].color
                }}
              >
                {(() => {
                  const Icon = NODE_CONFIGS[selectedNode.data.nodeType].icon
                  return <Icon className="w-4 h-4" />
                })()}
                {NODE_CONFIGS[selectedNode.data.nodeType].label}
              </div>
              
              {!readOnly && selectedNode.data.nodeType !== 'start' && (
                <button
                  onClick={() => deleteNode(selectedNode.id)}
                  className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Node Title */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Title</label>
              <input
                type="text"
                value={selectedNode.data.label}
                onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
                className="w-full px-3 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={readOnly}
              />
            </div>

            {/* Node Content */}
            <div>
              <label className="block text-sm text-gray-400 mb-1">Content</label>
              <textarea
                value={selectedNode.data.content}
                onChange={(e) => updateNodeData(selectedNode.id, { content: e.target.value })}
                className="w-full px-3 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none"
                placeholder="Write the narrative text, puzzle description, or combat scenario..."
                disabled={readOnly}
              />
            </div>

            {/* Type-specific Properties */}
            {selectedNode.data.nodeType === 'choice' && (
              <div className="p-3 bg-amber-900/20 rounded-lg border border-amber-700/50">
                <p className="text-xs text-amber-400 mb-2">
                  💡 Connect this node to multiple destinations to create branching paths.
                </p>
                <p className="text-xs text-gray-400">
                  Each connection will become a choice for the player.
                </p>
              </div>
            )}

            {selectedNode.data.nodeType === 'puzzle' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Solution Hint</label>
                <input
                  type="text"
                  placeholder="What's the answer?"
                  className="w-full px-3 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={readOnly}
                />
              </div>
            )}

            {selectedNode.data.nodeType === 'reward' && (
              <div>
                <label className="block text-sm text-gray-400 mb-1">Reward Type</label>
                <select 
                  className="w-full px-3 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={readOnly}
                >
                  <option value="lore">Lore Fragment</option>
                  <option value="item">Item</option>
                  <option value="ability">Ability</option>
                  <option value="connection">Story Connection</option>
                </select>
              </div>
            )}

            {/* AI Suggestions */}
            <div className="mt-4 p-3 bg-charcoal rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-gray-300">AI Suggestions</span>
              </div>
              <div className="space-y-2">
                <button className="w-full px-3 py-2 text-left text-xs bg-blue-900/30 hover:bg-blue-900/50 rounded border border-blue-700/50 transition-colors text-blue-300">
                  ✨ Generate narrative continuation
                </button>
                <button className="w-full px-3 py-2 text-left text-xs bg-purple-900/30 hover:bg-purple-900/50 rounded border border-purple-700/50 transition-colors text-purple-300">
                  🔮 Suggest lore-appropriate choices
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-4 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Description</label>
              <textarea
                value={quest.description}
                onChange={(e) => setQuest({ ...quest, description: e.target.value })}
                className="w-full px-3 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] resize-none"
                placeholder="Describe your quest..."
                disabled={readOnly}
              />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-charcoal rounded-lg">
                <span className="text-gray-400">Nodes</span>
                <p className="text-xl font-bold text-white">{nodes.length}</p>
              </div>
              <div className="p-3 bg-charcoal rounded-lg">
                <span className="text-gray-400">Connections</span>
                <p className="text-xl font-bold text-white">{edges.length}</p>
              </div>
            </div>

            <div className="p-3 bg-charcoal rounded-lg border border-gray-700">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Quick Tips</h4>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Start with a "Start" node</li>
                <li>• Use "Choice" nodes for branching</li>
                <li>• End paths with "Ending" nodes</li>
                <li>• Connect nodes by dragging from handles</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy rounded-xl border border-gray-700 w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quest Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Estimated Time (minutes)</label>
                <input
                  type="number"
                  placeholder="15"
                  className="w-full px-3 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Visibility</label>
                <select className="w-full px-3 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="private">Private Sandbox</option>
                  <option value="branch_canon">Branch Canon</option>
                  <option value="public_canon">Public Canon</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Link to Story</label>
                <select className="w-full px-3 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">No linked story</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Link to Location</label>
                <select className="w-full px-3 py-2 bg-charcoal border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">No linked location</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NPCs Modal */}
      {showNPCs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-navy rounded-xl border border-gray-700 w-full max-w-2xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quest NPCs</h3>
            
            <div className="min-h-[300px] flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg">
              <div className="text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No NPCs created yet</p>
                <button className="mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4 inline mr-1" />
                  Create NPC
                </button>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowNPCs(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
