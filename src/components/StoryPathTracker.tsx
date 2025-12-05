'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
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
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { 
  BookOpen, User, MapPin, Clock, Diamond, GitBranch, 
  Plus, Eye, Download, Filter, Layers, Link2, Sparkles,
  ChevronRight, RefreshCw, Zap
} from 'lucide-react'

// Story node types for the path tracker
type StoryNodeType = 'story' | 'character' | 'location' | 'shard' | 'event' | 'branch' | 'fold'

interface StoryNodeData extends Record<string, unknown> {
  label: string
  nodeType: StoryNodeType
  description: string
  author?: string
  timestamp?: string
  connections: number
  status: 'approved' | 'pending' | 'draft'
}

interface StoryConnection {
  id: string
  type: 'continuation' | 'branch' | 'reference' | 'shared_character' | 'shared_location' | 'shard_influence' | 'fold_event'
  label?: string
}

const NODE_CONFIGS: Record<StoryNodeType, { icon: typeof BookOpen; color: string; label: string }> = {
  story: { icon: BookOpen, color: '#3b82f6', label: 'Story' },
  character: { icon: User, color: '#f59e0b', label: 'Character' },
  location: { icon: MapPin, color: '#22c55e', label: 'Location' },
  shard: { icon: Diamond, color: '#ec4899', label: 'Shard' },
  event: { icon: Clock, color: '#8b5cf6', label: 'Event' },
  branch: { icon: GitBranch, color: '#06b6d4', label: 'Branch' },
  fold: { icon: RefreshCw, color: '#ef4444', label: 'Fold' },
}

const EDGE_COLORS: Record<string, string> = {
  continuation: '#3b82f6',
  branch: '#06b6d4',
  reference: '#9ca3af',
  shared_character: '#f59e0b',
  shared_location: '#22c55e',
  shard_influence: '#ec4899',
  fold_event: '#ef4444',
}

// Custom Story Node Component
function StoryPathNode({ data, selected }: NodeProps) {
  const nodeData = data as StoryNodeData
  const config = NODE_CONFIGS[nodeData.nodeType]
  const Icon = config.icon

  const statusColors = {
    approved: 'border-green-500/50 bg-green-500/10',
    pending: 'border-yellow-500/50 bg-yellow-500/10',
    draft: 'border-gray-500/50 bg-gray-500/10',
  }

  return (
    <div 
      className={`px-4 py-3 rounded-xl border-2 min-w-[200px] max-w-[280px] transition-all ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-[#0a0f1a]' : ''
      } ${statusColors[nodeData.status]}`}
      style={{ 
        backgroundColor: '#12172a',
        borderColor: config.color + '60',
      }}
    >
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-3 !h-3 !bg-gray-500 !border-2 !border-[#0a0f1a]" 
      />
      
      <div className="flex items-start gap-3">
        <div 
          className="p-2 rounded-lg flex-shrink-0"
          style={{ backgroundColor: config.color + '20' }}
        >
          <Icon className="w-5 h-5" style={{ color: config.color }} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] uppercase tracking-wide text-gray-500">{config.label}</span>
            {nodeData.status === 'approved' && (
              <span className="text-[8px] px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">Canon</span>
            )}
          </div>
          
          <p className="text-sm text-white font-medium truncate">{nodeData.label}</p>
          
          {nodeData.description && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-2">{nodeData.description}</p>
          )}
          
          <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500">
            {nodeData.author && <span>by {nodeData.author}</span>}
            {nodeData.connections > 0 && (
              <span className="flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                {nodeData.connections}
              </span>
            )}
          </div>
        </div>
      </div>

      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-3 !h-3 !bg-gray-500 !border-2 !border-[#0a0f1a]" 
      />
    </div>
  )
}

const nodeTypes = {
  storyPath: StoryPathNode,
}

// Sample data for demonstration
const SAMPLE_NODES: Node<StoryNodeData>[] = [
  {
    id: '1',
    type: 'storyPath',
    position: { x: 0, y: 200 },
    data: {
      label: 'The First Weaving',
      nodeType: 'story',
      description: 'The origin story of the Weaver civilization',
      author: 'FounderWriter',
      connections: 5,
      status: 'approved',
    },
  },
  {
    id: '2',
    type: 'storyPath',
    position: { x: 300, y: 100 },
    data: {
      label: 'Elder Mira',
      nodeType: 'character',
      description: 'The last of the original Weavers',
      author: 'FounderWriter',
      connections: 8,
      status: 'approved',
    },
  },
  {
    id: '3',
    type: 'storyPath',
    position: { x: 300, y: 300 },
    data: {
      label: 'The Sunken Hollow',
      nodeType: 'location',
      description: 'Ancient temple beneath the waves',
      author: 'WorldBuilder',
      connections: 3,
      status: 'approved',
    },
  },
  {
    id: '4',
    type: 'storyPath',
    position: { x: 600, y: 50 },
    data: {
      label: 'The Binding Shard',
      nodeType: 'shard',
      description: 'A shard that connects souls across time',
      connections: 4,
      status: 'approved',
    },
  },
  {
    id: '5',
    type: 'storyPath',
    position: { x: 600, y: 200 },
    data: {
      label: "Mira's Last Stand",
      nodeType: 'story',
      description: 'The final battle against the Fray',
      author: 'EpicTeller',
      connections: 2,
      status: 'approved',
    },
  },
  {
    id: '6',
    type: 'storyPath',
    position: { x: 600, y: 350 },
    data: {
      label: 'The Great Unraveling',
      nodeType: 'event',
      description: 'When reality began to fracture',
      connections: 6,
      status: 'approved',
    },
  },
  {
    id: '7',
    type: 'storyPath',
    position: { x: 900, y: 150 },
    data: {
      label: 'What If: Mira Fell',
      nodeType: 'branch',
      description: 'An alternate timeline exploration',
      author: 'BranchExplorer',
      connections: 1,
      status: 'pending',
    },
  },
  {
    id: '8',
    type: 'storyPath',
    position: { x: 900, y: 300 },
    data: {
      label: 'The Temporal Fold',
      nodeType: 'fold',
      description: 'A moment where timelines converged',
      connections: 3,
      status: 'approved',
    },
  },
]

const SAMPLE_EDGES: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', animated: true, style: { stroke: EDGE_COLORS.shared_character }, label: 'introduces' },
  { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', style: { stroke: EDGE_COLORS.shared_location } },
  { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', style: { stroke: EDGE_COLORS.shard_influence } },
  { id: 'e2-5', source: '2', target: '5', type: 'smoothstep', animated: true, style: { stroke: EDGE_COLORS.continuation }, label: 'continues in' },
  { id: 'e3-6', source: '3', target: '6', type: 'smoothstep', style: { stroke: EDGE_COLORS.reference } },
  { id: 'e5-7', source: '5', target: '7', type: 'smoothstep', style: { stroke: EDGE_COLORS.branch, strokeDasharray: '5,5' }, label: 'branches' },
  { id: 'e6-8', source: '6', target: '8', type: 'smoothstep', animated: true, style: { stroke: EDGE_COLORS.fold_event } },
  { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', style: { stroke: EDGE_COLORS.shard_influence } },
]

interface StoryPathTrackerProps {
  stories?: Node<StoryNodeData>[]
  connections?: Edge[]
  onNodeClick?: (node: Node<StoryNodeData>) => void
  onExport?: () => void
}

export default function StoryPathTracker({
  stories = SAMPLE_NODES,
  connections = SAMPLE_EDGES,
  onNodeClick,
  onExport,
}: StoryPathTrackerProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(stories)
  const [edges, setEdges, onEdgesChange] = useEdgesState(connections)
  const [selectedFilter, setSelectedFilter] = useState<StoryNodeType | 'all'>('all')
  const [showLegend, setShowLegend] = useState(true)

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge({
        ...connection,
        type: 'smoothstep',
        animated: true,
        style: { stroke: EDGE_COLORS.reference },
      }, eds))
    },
    [setEdges]
  )

  const filteredNodes = useMemo(() => {
    if (selectedFilter === 'all') return nodes
    return nodes.filter(n => (n.data as StoryNodeData).nodeType === selectedFilter)
  }, [nodes, selectedFilter])

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set(filteredNodes.map(n => n.id))
    return edges.filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
  }, [edges, filteredNodes])

  const stats = useMemo(() => ({
    stories: nodes.filter(n => (n.data as StoryNodeData).nodeType === 'story').length,
    characters: nodes.filter(n => (n.data as StoryNodeData).nodeType === 'character').length,
    locations: nodes.filter(n => (n.data as StoryNodeData).nodeType === 'location').length,
    connections: edges.length,
  }), [nodes, edges])

  return (
    <div className="h-full flex flex-col bg-[#0a0f1a]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
            <GitBranch className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Story Path Tracker</h2>
            <p className="text-xs text-gray-500">Canon Weave Visualization</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 text-xs text-gray-400">
            <span>{stats.stories} stories</span>
            <span>{stats.characters} characters</span>
            <span>{stats.locations} locations</span>
            <span>{stats.connections} connections</span>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onExport}
              className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4 text-gray-400" />
            </button>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className={`p-2 rounded-lg transition-colors ${
                showLegend ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-800 overflow-x-auto">
        <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
            selectedFilter === 'all' 
              ? 'bg-white/10 text-white' 
              : 'text-gray-400 hover:bg-gray-800'
          }`}
        >
          All
        </button>
        {Object.entries(NODE_CONFIGS).map(([type, config]) => (
          <button
            key={type}
            onClick={() => setSelectedFilter(type as StoryNodeType)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-colors ${
              selectedFilter === type 
                ? 'text-white' 
                : 'text-gray-400 hover:bg-gray-800'
            }`}
            style={{
              backgroundColor: selectedFilter === type ? config.color + '30' : undefined,
            }}
          >
            <config.icon className="w-3 h-3" style={{ color: config.color }} />
            {config.label}
          </button>
        ))}
      </div>

      {/* Flow Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => onNodeClick?.(node as Node<StoryNodeData>)}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
          }}
          proOptions={{ hideAttribution: true }}
        >
          <Background color="#1e293b" gap={20} size={1} />
          <Controls 
            className="!bg-gray-800 !border-gray-700 !rounded-lg [&>button]:!bg-gray-800 [&>button]:!border-gray-700 [&>button]:!text-gray-400 [&>button:hover]:!bg-gray-700"
          />
          <MiniMap 
            className="!bg-gray-900 !border-gray-800 !rounded-lg"
            nodeColor={(node) => {
              const nodeType = (node.data as StoryNodeData).nodeType
              return NODE_CONFIGS[nodeType]?.color || '#6b7280'
            }}
            maskColor="rgba(0, 0, 0, 0.8)"
          />

          {/* Legend Panel */}
          {showLegend && (
            <Panel position="bottom-left" className="!m-4">
              <div className="bg-gray-900/95 backdrop-blur-sm border border-gray-800 rounded-lg p-4 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Node Types</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(NODE_CONFIGS).map(([type, config]) => (
                      <div key={type} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: config.color }}
                        />
                        <span className="text-xs text-gray-300">{config.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Connection Types</h4>
                  <div className="space-y-1">
                    {Object.entries(EDGE_COLORS).slice(0, 4).map(([type, color]) => (
                      <div key={type} className="flex items-center gap-2">
                        <div 
                          className="w-6 h-0.5"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-xs text-gray-300 capitalize">{type.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  )
}
