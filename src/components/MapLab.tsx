'use client'

import { useState, useRef, useCallback } from 'react'
import { Stage, Layer, Rect, Circle, Line, Text, Group, Star as KonvaStar, RegularPolygon } from 'react-konva'
import { 
  Mountain, Waves, TreeDeciduous, Circle as CircleIcon, 
  Wind, Zap, Home, Diamond, Landmark, Box, 
  Plus, Trash2, Save, Download, Eye, Upload,
  MousePointer, Move, Link2, Sparkles
} from 'lucide-react'
import type { MapElementType, StoryPathType, MapElement, StoryPath } from '@/types/database'

interface MapElementData {
  id: string
  type: MapElementType
  x: number
  y: number
  name: string
  description: string
  scale: number
  rotation: number
}

interface StoryPathData {
  id: string
  fromId: string
  toId: string
  type: StoryPathType
  description: string
  waypoints: { x: number; y: number }[]
}

const ELEMENT_ICONS: Record<MapElementType, { icon: typeof Mountain; color: string }> = {
  mountain: { icon: Mountain, color: '#6b7280' },
  river: { icon: Waves, color: '#3b82f6' },
  bell_tree: { icon: TreeDeciduous, color: '#22c55e' },
  hollow: { icon: CircleIcon, color: '#8b5cf6' },
  drift_line: { icon: Wind, color: '#06b6d4' },
  fray_zone: { icon: Zap, color: '#ef4444' },
  settlement: { icon: Home, color: '#f59e0b' },
  shard_site: { icon: Diamond, color: '#ec4899' },
  ruin: { icon: Landmark, color: '#78716c' },
  folded_structure: { icon: Box, color: '#6366f1' },
  custom: { icon: Sparkles, color: '#a855f7' },
}

const PATH_COLORS: Record<StoryPathType, string> = {
  journey: '#f59e0b',
  trade_route: '#22c55e',
  drift_passage: '#06b6d4',
  fray_corridor: '#ef4444',
  ley_line: '#8b5cf6',
}

type Tool = 'select' | 'pan' | 'path'

interface MapLabProps {
  mapId?: string
  initialElements?: MapElement[]
  initialPaths?: StoryPath[]
  onSave?: (elements: MapElementData[], paths: StoryPathData[]) => void
  readOnly?: boolean
}

export default function MapLab({ 
  mapId, 
  initialElements = [], 
  initialPaths = [], 
  onSave,
  readOnly = false 
}: MapLabProps) {
  const [elements, setElements] = useState<MapElementData[]>(
    initialElements.map(e => ({
      id: e.id,
      type: e.element_type,
      x: e.x_position,
      y: e.y_position,
      name: e.name || '',
      description: e.description || '',
      scale: e.scale,
      rotation: e.rotation,
    }))
  )
  const [paths, setPaths] = useState<StoryPathData[]>(
    initialPaths.map(p => ({
      id: p.id,
      fromId: p.from_element_id,
      toId: p.to_element_id,
      type: p.path_type,
      description: p.description || '',
      waypoints: (p.waypoints as { x: number; y: number }[]) || [],
    }))
  )
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [tool, setTool] = useState<Tool>('select')
  const [selectedElementType, setSelectedElementType] = useState<MapElementType>('settlement')
  const [selectedPathType, setSelectedPathType] = useState<StoryPathType>('journey')
  const [pathStart, setPathStart] = useState<string | null>(null)
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 })
  const [stageScale, setStageScale] = useState(1)
  const [showAIPanel, setShowAIPanel] = useState(false)
  
  const stageRef = useRef<any>(null)

  const handleStageClick = useCallback((e: any) => {
    if (readOnly) return
    
    const stage = e.target.getStage()
    const pointerPos = stage.getPointerPosition()
    const x = (pointerPos.x - stagePosition.x) / stageScale
    const y = (pointerPos.y - stagePosition.y) / stageScale

    // If clicking on empty space
    if (e.target === stage) {
      if (tool === 'select') {
        setSelectedId(null)
        setPathStart(null)
      }
    }
  }, [tool, stagePosition, stageScale, readOnly])

  const handleAddElement = useCallback((type: MapElementType, x: number, y: number) => {
    const newElement: MapElementData = {
      id: `element-${Date.now()}`,
      type,
      x,
      y,
      name: '',
      description: '',
      scale: 1,
      rotation: 0,
    }
    setElements(prev => [...prev, newElement])
    setSelectedId(newElement.id)
    setShowAIPanel(true)
  }, [])

  const handleElementClick = useCallback((id: string) => {
    if (tool === 'path') {
      if (!pathStart) {
        setPathStart(id)
      } else if (pathStart !== id) {
        // Create path between pathStart and id
        const newPath: StoryPathData = {
          id: `path-${Date.now()}`,
          fromId: pathStart,
          toId: id,
          type: selectedPathType,
          description: '',
          waypoints: [],
        }
        setPaths(prev => [...prev, newPath])
        setPathStart(null)
      }
    } else {
      setSelectedId(id)
    }
  }, [tool, pathStart, selectedPathType])

  const handleElementDrag = useCallback((id: string, x: number, y: number) => {
    if (readOnly) return
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, x, y } : el
    ))
  }, [readOnly])

  const handleDeleteSelected = useCallback(() => {
    if (!selectedId) return
    setElements(prev => prev.filter(el => el.id !== selectedId))
    setPaths(prev => prev.filter(p => p.fromId !== selectedId && p.toId !== selectedId))
    setSelectedId(null)
  }, [selectedId])

  const handleWheel = useCallback((e: any) => {
    e.evt.preventDefault()
    const stage = e.target.getStage()
    const oldScale = stageScale
    const pointer = stage.getPointerPosition()

    const scaleBy = 1.1
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy
    const clampedScale = Math.max(0.1, Math.min(3, newScale))

    setStageScale(clampedScale)
    setStagePosition({
      x: pointer.x - ((pointer.x - stagePosition.x) / oldScale) * clampedScale,
      y: pointer.y - ((pointer.y - stagePosition.y) / oldScale) * clampedScale,
    })
  }, [stageScale, stagePosition])

  const handleSave = useCallback(() => {
    onSave?.(elements, paths)
  }, [elements, paths, onSave])

  const renderElement = (element: MapElementData) => {
    const { icon: Icon, color } = ELEMENT_ICONS[element.type]
    const isSelected = selectedId === element.id
    const isPathStart = pathStart === element.id
    
    return (
      <Group
        key={element.id}
        x={element.x}
        y={element.y}
        draggable={!readOnly && tool === 'select'}
        onClick={() => handleElementClick(element.id)}
        onTap={() => handleElementClick(element.id)}
        onDragEnd={(e) => handleElementDrag(element.id, e.target.x(), e.target.y())}
        scaleX={element.scale}
        scaleY={element.scale}
        rotation={element.rotation}
      >
        {/* Selection ring */}
        {(isSelected || isPathStart) && (
          <Circle
            radius={28}
            stroke={isPathStart ? '#22c55e' : '#3b82f6'}
            strokeWidth={2}
            dash={[5, 5]}
          />
        )}
        
        {/* Element background */}
        <Circle
          radius={24}
          fill={color}
          opacity={0.8}
          shadowColor="black"
          shadowBlur={10}
          shadowOpacity={0.3}
        />
        
        {/* Element icon representation */}
        {element.type === 'mountain' && (
          <RegularPolygon
            sides={3}
            radius={16}
            fill="white"
            opacity={0.9}
          />
        )}
        {element.type === 'settlement' && (
          <Rect
            x={-10}
            y={-10}
            width={20}
            height={20}
            fill="white"
            opacity={0.9}
          />
        )}
        {element.type === 'bell_tree' && (
          <KonvaStar
            numPoints={5}
            innerRadius={8}
            outerRadius={16}
            fill="white"
            opacity={0.9}
          />
        )}
        {(element.type !== 'mountain' && element.type !== 'settlement' && element.type !== 'bell_tree') && (
          <Circle
            radius={12}
            fill="white"
            opacity={0.9}
          />
        )}
        
        {/* Element name */}
        {element.name && (
          <Text
            text={element.name}
            fontSize={12}
            fill="white"
            y={30}
            width={100}
            align="center"
            offsetX={50}
          />
        )}
      </Group>
    )
  }

  const renderPath = (path: StoryPathData) => {
    const fromElement = elements.find(e => e.id === path.fromId)
    const toElement = elements.find(e => e.id === path.toId)
    
    if (!fromElement || !toElement) return null

    const points = [
      fromElement.x, fromElement.y,
      ...path.waypoints.flatMap(w => [w.x, w.y]),
      toElement.x, toElement.y,
    ]

    return (
      <Line
        key={path.id}
        points={points}
        stroke={PATH_COLORS[path.type]}
        strokeWidth={3}
        opacity={0.7}
        dash={path.type === 'drift_passage' ? [10, 5] : undefined}
        lineCap="round"
        lineJoin="round"
        tension={0.3}
        onClick={() => setSelectedId(path.id)}
      />
    )
  }

  const selectedElement = elements.find(e => e.id === selectedId)

  return (
    <div className="flex h-full bg-charcoal">
      {/* Left Toolbar */}
      <div className="w-16 bg-navy border-r border-gray-700 flex flex-col items-center py-4 gap-2">
        {/* Tools */}
        <button
          onClick={() => setTool('select')}
          className={`p-3 rounded-lg transition-colors ${tool === 'select' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          title="Select & Move"
        >
          <MousePointer className="w-5 h-5" />
        </button>
        <button
          onClick={() => setTool('pan')}
          className={`p-3 rounded-lg transition-colors ${tool === 'pan' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          title="Pan"
        >
          <Move className="w-5 h-5" />
        </button>
        <button
          onClick={() => setTool('path')}
          className={`p-3 rounded-lg transition-colors ${tool === 'path' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          title="Create Story Path"
        >
          <Link2 className="w-5 h-5" />
        </button>
        
        <div className="h-px w-10 bg-gray-700 my-2" />
        
        {/* Element Types */}
        {(Object.entries(ELEMENT_ICONS) as [MapElementType, { icon: typeof Mountain; color: string }][]).map(([type, { icon: Icon, color }]) => (
          <button
            key={type}
            onClick={() => setSelectedElementType(type)}
            className={`p-2 rounded-lg transition-colors ${selectedElementType === type ? 'ring-2 ring-blue-500' : 'hover:bg-gray-700'}`}
            style={{ backgroundColor: selectedElementType === type ? color + '40' : undefined }}
            title={type.replace('_', ' ')}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </button>
        ))}
        
        <div className="flex-1" />
        
        {/* Actions */}
        {!readOnly && (
          <>
            <button
              onClick={handleDeleteSelected}
              disabled={!selectedId}
              className="p-3 rounded-lg hover:bg-red-900/50 disabled:opacity-30 text-red-400"
              title="Delete Selected"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="p-3 rounded-lg hover:bg-green-900/50 text-green-400"
              title="Save Map"
            >
              <Save className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative">
        <Stage
          ref={stageRef}
          width={typeof window !== 'undefined' ? window.innerWidth - 400 : 800}
          height={typeof window !== 'undefined' ? window.innerHeight - 100 : 600}
          onClick={handleStageClick}
          onWheel={handleWheel}
          scaleX={stageScale}
          scaleY={stageScale}
          x={stagePosition.x}
          y={stagePosition.y}
          draggable={tool === 'pan'}
          onDragEnd={(e) => setStagePosition({ x: e.target.x(), y: e.target.y() })}
          style={{ backgroundColor: '#1a1f2e' }}
        >
          <Layer>
            {/* Grid */}
            {Array.from({ length: 50 }).map((_, i) => (
              <Line
                key={`v-${i}`}
                points={[i * 100, 0, i * 100, 5000]}
                stroke="#2a2f3e"
                strokeWidth={1}
              />
            ))}
            {Array.from({ length: 50 }).map((_, i) => (
              <Line
                key={`h-${i}`}
                points={[0, i * 100, 5000, i * 100]}
                stroke="#2a2f3e"
                strokeWidth={1}
              />
            ))}
            
            {/* Paths */}
            {paths.map(renderPath)}
            
            {/* Elements */}
            {elements.map(renderElement)}
          </Layer>
        </Stage>

        {/* Add Element Button */}
        {!readOnly && (
          <button
            onClick={() => handleAddElement(selectedElementType, 400, 300)}
            className="absolute bottom-4 right-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add {selectedElementType.replace('_', ' ')}
          </button>
        )}

        {/* Zoom indicator */}
        <div className="absolute bottom-4 left-4 px-3 py-1 bg-navy/80 rounded text-sm text-gray-400">
          {Math.round(stageScale * 100)}%
        </div>
      </div>

      {/* Right Panel - Properties & AI */}
      <div className="w-80 bg-navy border-l border-gray-700 flex flex-col">
        {/* Properties Panel */}
        {selectedElement && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Element Properties</h3>
            
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Name</label>
                <input
                  type="text"
                  value={selectedElement.name}
                  onChange={(e) => setElements(prev => prev.map(el =>
                    el.id === selectedId ? { ...el, name: e.target.value } : el
                  ))}
                  className="w-full px-3 py-2 bg-charcoal border border-gray-700 rounded-lg text-sm"
                  placeholder="Location name..."
                  disabled={readOnly}
                />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Description</label>
                <textarea
                  value={selectedElement.description}
                  onChange={(e) => setElements(prev => prev.map(el =>
                    el.id === selectedId ? { ...el, description: e.target.value } : el
                  ))}
                  className="w-full px-3 py-2 bg-charcoal border border-gray-700 rounded-lg text-sm h-20 resize-none"
                  placeholder="Describe this location..."
                  disabled={readOnly}
                />
              </div>
              
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Scale</label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={selectedElement.scale}
                    onChange={(e) => setElements(prev => prev.map(el =>
                      el.id === selectedId ? { ...el, scale: parseFloat(e.target.value) } : el
                    ))}
                    className="w-full"
                    disabled={readOnly}
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Rotation</label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={selectedElement.rotation}
                    onChange={(e) => setElements(prev => prev.map(el =>
                      el.id === selectedId ? { ...el, rotation: parseFloat(e.target.value) } : el
                    ))}
                    className="w-full"
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Path Type Selector */}
        {tool === 'path' && (
          <div className="p-4 border-b border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Story Path Type</h3>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(PATH_COLORS) as [StoryPathType, string][]).map(([type, color]) => (
                <button
                  key={type}
                  onClick={() => setSelectedPathType(type)}
                  className={`px-3 py-2 rounded-lg text-xs text-left transition-colors ${
                    selectedPathType === type ? 'ring-2 ring-blue-500' : ''
                  }`}
                  style={{ 
                    backgroundColor: selectedPathType === type ? color + '30' : '#1a1f2e',
                    borderLeft: `3px solid ${color}`
                  }}
                >
                  {type.replace('_', ' ')}
                </button>
              ))}
            </div>
            {pathStart && (
              <p className="mt-3 text-xs text-green-400">
                Click another element to complete the path
              </p>
            )}
          </div>
        )}

        {/* AI Suggestions Panel */}
        <div className="flex-1 p-4 overflow-y-auto">
          <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            AI Suggestions
          </h3>
          
          {selectedElement && (
            <div className="space-y-3">
              <div className="p-3 bg-charcoal rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 mb-2">
                  Would you like to turn this location into...
                </p>
                <div className="space-y-2">
                  <button className="w-full px-3 py-2 text-left text-sm bg-blue-900/30 hover:bg-blue-900/50 rounded border border-blue-700/50 transition-colors">
                    📖 A story seed
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm bg-purple-900/30 hover:bg-purple-900/50 rounded border border-purple-700/50 transition-colors">
                    📚 A lore entry
                  </button>
                  <button className="w-full px-3 py-2 text-left text-sm bg-amber-900/30 hover:bg-amber-900/50 rounded border border-amber-700/50 transition-colors">
                    ⚔️ A playable quest hook
                  </button>
                </div>
              </div>
              
              {selectedElement.type === 'fray_zone' && (
                <div className="p-3 bg-red-900/20 rounded-lg border border-red-700/50">
                  <p className="text-xs text-red-400">
                    ⚠️ Fray zones cause temporal instability. Consider how this affects nearby settlements.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {!selectedElement && (
            <p className="text-sm text-gray-500">
              Select an element to see AI suggestions
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
