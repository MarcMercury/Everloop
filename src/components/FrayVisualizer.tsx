'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { 
  Zap, Clock, User, MapPin, Play, Pause, RefreshCw, 
  Sparkles, Eye, Download, Settings, ChevronDown, ChevronUp,
  Layers, Wind, AlertTriangle, Moon, Sun
} from 'lucide-react'

interface TimeState {
  id: string
  label: string
  era: 'past' | 'present' | 'future' | 'fractured'
  description: string
  color: string
}

interface FoldPattern {
  id: string
  name: string
  intensity: number // 0-1
  type: 'flicker' | 'distort' | 'echo' | 'shatter' | 'merge'
  description: string
}

interface FrayEvent {
  id: string
  name: string
  severity: 'minor' | 'moderate' | 'major' | 'catastrophic'
  consequences: string[]
  timestamp: number
}

interface VisualizerTarget {
  id: string
  type: 'location' | 'character' | 'event'
  name: string
  description: string
  timeStates: TimeState[]
  foldPatterns: FoldPattern[]
  frayEvents: FrayEvent[]
}

const DEFAULT_TIME_STATES: TimeState[] = [
  { id: '1', label: 'Ancient Past', era: 'past', description: 'Before the Weave was fully formed', color: '#6366f1' },
  { id: '2', label: 'Golden Era', era: 'past', description: 'Height of the Weaver civilization', color: '#22c55e' },
  { id: '3', label: 'The Fracturing', era: 'fractured', description: 'When reality began to splinter', color: '#ef4444' },
  { id: '4', label: 'Present Day', era: 'present', description: 'Current timeline', color: '#3b82f6' },
  { id: '5', label: 'Possible Future', era: 'future', description: 'One of many potential outcomes', color: '#8b5cf6' },
]

const DEFAULT_FOLD_PATTERNS: FoldPattern[] = [
  { id: '1', name: 'Temporal Flicker', intensity: 0.3, type: 'flicker', description: 'Rapid shifts between time states' },
  { id: '2', name: 'Reality Distortion', intensity: 0.5, type: 'distort', description: 'Spatial warping and visual glitches' },
  { id: '3', name: 'Echo Cascade', intensity: 0.7, type: 'echo', description: 'Overlapping images of past selves' },
  { id: '4', name: 'Memory Shatter', intensity: 0.9, type: 'shatter', description: 'Fragmented reality, broken timelines' },
  { id: '5', name: 'Timeline Merge', intensity: 1.0, type: 'merge', description: 'Multiple timelines collapsing into one' },
]

interface FrayVisualizerProps {
  target?: VisualizerTarget
  onExportSequence?: (sequence: string) => void
}

export default function FrayVisualizer({ 
  target,
  onExportSequence 
}: FrayVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTimeState, setCurrentTimeState] = useState<TimeState>(DEFAULT_TIME_STATES[3])
  const [activeFoldPattern, setActiveFoldPattern] = useState<FoldPattern | null>(null)
  const [frayIntensity, setFrayIntensity] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedTarget, setSelectedTarget] = useState<'location' | 'character'>('location')
  
  // Visual parameters
  const [glitchIntensity, setGlitchIntensity] = useState(0.5)
  const [chromaticAberration, setChromaticAberration] = useState(0.3)
  const [noiseLevel, setNoiseLevel] = useState(0.2)
  const [flickerSpeed, setFlickerSpeed] = useState(0.5)

  // Canvas drawing functions
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    // Create gradient based on current time state
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, width * 0.8
    )
    
    const baseColor = currentTimeState.color
    gradient.addColorStop(0, baseColor + '40')
    gradient.addColorStop(0.5, '#0a0f1a')
    gradient.addColorStop(1, '#050810')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)
    
    // Add noise/grain effect
    if (noiseLevel > 0) {
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data
      const noise = noiseLevel * 30
      
      for (let i = 0; i < data.length; i += 4) {
        const n = (Math.random() - 0.5) * noise
        data[i] += n
        data[i + 1] += n
        data[i + 2] += n
      }
      ctx.putImageData(imageData, 0, 0)
    }
  }, [currentTimeState, noiseLevel])

  const drawFrayZone = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    const centerX = width / 2
    const centerY = height / 2
    const baseRadius = Math.min(width, height) * 0.25
    
    // Draw pulsing Fray zone
    const pulseRadius = baseRadius + Math.sin(time * 0.002) * 20 * frayIntensity
    
    // Outer glow
    const gradient = ctx.createRadialGradient(
      centerX, centerY, pulseRadius * 0.5,
      centerX, centerY, pulseRadius * 1.5
    )
    gradient.addColorStop(0, `rgba(239, 68, 68, ${0.3 * frayIntensity})`)
    gradient.addColorStop(0.5, `rgba(239, 68, 68, ${0.1 * frayIntensity})`)
    gradient.addColorStop(1, 'transparent')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, pulseRadius * 1.5, 0, Math.PI * 2)
    ctx.fill()
    
    // Inner core with flickering
    if (activeFoldPattern?.type === 'flicker') {
      const flicker = Math.random() > 0.5 ? 1 : 0.5
      ctx.globalAlpha = flicker
    }
    
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.8 * frayIntensity})`
    ctx.lineWidth = 2 + Math.sin(time * 0.01) * 2
    ctx.beginPath()
    ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
    
    // Draw instability lines
    const numLines = Math.floor(8 + frayIntensity * 12)
    ctx.strokeStyle = `rgba(239, 68, 68, ${0.4 * frayIntensity})`
    ctx.lineWidth = 1
    
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2 + time * 0.001
      const wobble = Math.sin(time * 0.003 + i) * 20 * frayIntensity
      
      ctx.beginPath()
      ctx.moveTo(
        centerX + Math.cos(angle) * pulseRadius,
        centerY + Math.sin(angle) * pulseRadius
      )
      ctx.lineTo(
        centerX + Math.cos(angle) * (pulseRadius + 50 + wobble),
        centerY + Math.sin(angle) * (pulseRadius + 50 + wobble)
      )
      ctx.stroke()
    }
  }, [frayIntensity, activeFoldPattern])

  const drawFoldEffects = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => {
    if (!activeFoldPattern) return
    
    const intensity = activeFoldPattern.intensity
    const centerX = width / 2
    const centerY = height / 2
    
    switch (activeFoldPattern.type) {
      case 'echo':
        // Draw echoing circles representing past selves
        for (let i = 0; i < 5; i++) {
          const offset = (time * 0.002 + i * 0.5) % 3
          const alpha = (1 - offset / 3) * intensity * 0.5
          ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.arc(
            centerX + Math.sin(time * 0.001 + i) * 30,
            centerY + Math.cos(time * 0.0015 + i) * 20,
            50 + offset * 30,
            0,
            Math.PI * 2
          )
          ctx.stroke()
        }
        break
        
      case 'distort':
        // Draw distortion waves
        ctx.strokeStyle = `rgba(6, 182, 212, ${intensity * 0.4})`
        ctx.lineWidth = 2
        
        for (let y = 0; y < height; y += 50) {
          ctx.beginPath()
          ctx.moveTo(0, y)
          for (let x = 0; x < width; x += 10) {
            const distortion = Math.sin(x * 0.02 + time * 0.003) * 20 * intensity
            ctx.lineTo(x, y + distortion)
          }
          ctx.stroke()
        }
        break
        
      case 'shatter':
        // Draw shattered reality fragments
        const fragments = 15
        for (let i = 0; i < fragments; i++) {
          const angle = (i / fragments) * Math.PI * 2
          const dist = 100 + Math.sin(time * 0.002 + i) * 50 * intensity
          
          ctx.save()
          ctx.translate(
            centerX + Math.cos(angle) * dist,
            centerY + Math.sin(angle) * dist
          )
          ctx.rotate(time * 0.001 + i)
          
          ctx.fillStyle = `rgba(236, 72, 153, ${intensity * 0.3})`
          ctx.beginPath()
          ctx.moveTo(0, -20)
          ctx.lineTo(15, 10)
          ctx.lineTo(-15, 10)
          ctx.closePath()
          ctx.fill()
          
          ctx.restore()
        }
        break
        
      case 'merge':
        // Draw merging timeline ribbons
        for (let i = 0; i < 3; i++) {
          const offset = i * (Math.PI * 2 / 3)
          ctx.strokeStyle = `rgba(${i === 0 ? '99, 102, 241' : i === 1 ? '34, 197, 94' : '249, 115, 22'}, ${intensity * 0.5})`
          ctx.lineWidth = 3
          
          ctx.beginPath()
          for (let t = 0; t < 100; t++) {
            const x = width * 0.2 + (width * 0.6 * t / 100)
            const y = centerY + Math.sin(t * 0.1 + time * 0.002 + offset) * 50 * (1 - t / 100)
            if (t === 0) ctx.moveTo(x, y)
            else ctx.lineTo(x, y)
          }
          ctx.stroke()
        }
        break
    }
  }, [activeFoldPattern])

  const drawTimeStateIndicator = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Draw time state label
    ctx.font = 'bold 14px Inter, sans-serif'
    ctx.fillStyle = currentTimeState.color
    ctx.fillText(currentTimeState.label, 20, 30)
    
    ctx.font = '12px Inter, sans-serif'
    ctx.fillStyle = '#9ca3af'
    ctx.fillText(currentTimeState.description, 20, 48)
    
    // Draw era indicator
    const eraColors: Record<string, string> = {
      past: '#6366f1',
      present: '#3b82f6',
      future: '#8b5cf6',
      fractured: '#ef4444'
    }
    
    ctx.beginPath()
    ctx.arc(width - 40, 35, 15, 0, Math.PI * 2)
    ctx.fillStyle = eraColors[currentTimeState.era] + '40'
    ctx.fill()
    ctx.strokeStyle = eraColors[currentTimeState.era]
    ctx.lineWidth = 2
    ctx.stroke()
    
    ctx.font = 'bold 10px Inter, sans-serif'
    ctx.fillStyle = eraColors[currentTimeState.era]
    ctx.textAlign = 'center'
    ctx.fillText(currentTimeState.era.toUpperCase().slice(0, 1), width - 40, 39)
    ctx.textAlign = 'left'
  }, [currentTimeState])

  const animate = useCallback((time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const width = canvas.width
    const height = canvas.height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw layers
    drawBackground(ctx, width, height, time)
    
    if (frayIntensity > 0) {
      drawFrayZone(ctx, width, height, time)
    }
    
    drawFoldEffects(ctx, width, height, time)
    drawTimeStateIndicator(ctx, width, height)
    
    // Chromatic aberration effect
    if (chromaticAberration > 0 && activeFoldPattern) {
      const imageData = ctx.getImageData(0, 0, width, height)
      const data = imageData.data
      const shift = Math.floor(chromaticAberration * 5)
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width - shift; x++) {
          const i = (y * width + x) * 4
          const j = (y * width + x + shift) * 4
          data[i] = data[j] // Shift red channel
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    }
  }, [isPlaying, drawBackground, drawFrayZone, drawFoldEffects, drawTimeStateIndicator, chromaticAberration, activeFoldPattern, frayIntensity])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio
    canvas.height = canvas.offsetHeight * window.devicePixelRatio
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      animate(Date.now())
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, animate])

  const handleExportSequence = () => {
    const sequence = `
# Fray/Fold Sequence Export

## Time State: ${currentTimeState.label}
Era: ${currentTimeState.era}
Description: ${currentTimeState.description}

## Active Fold Pattern: ${activeFoldPattern?.name || 'None'}
${activeFoldPattern ? `
Type: ${activeFoldPattern.type}
Intensity: ${(activeFoldPattern.intensity * 100).toFixed(0)}%
Effect: ${activeFoldPattern.description}
` : ''}

## Fray Intensity: ${(frayIntensity * 100).toFixed(0)}%

---

*This sequence can be incorporated into story drafts to describe temporal instability effects.*
    `.trim()
    
    onExportSequence?.(sequence)
  }

  return (
    <div className="h-full flex flex-col bg-[var(--background)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500/20 to-purple-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h2 className="font-semibold">Fray & Fold Visualizer</h2>
            <p className="text-xs text-[var(--foreground-muted)]">Temporal Instability Simulator</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-lg transition-colors ${
              isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)]'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          
          <button
            onClick={handleExportSequence}
            className="p-2 rounded-lg bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)] transition-colors"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-colors ${
              showSettings ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)]' : 'bg-[var(--background-secondary)] hover:bg-[var(--background-tertiary)]'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Canvas */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            style={{ imageRendering: 'pixelated' }}
          />
          
          {/* Overlay Controls */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2 bg-[var(--background)]/90 backdrop-blur-sm rounded-lg p-2">
              <span className="text-xs text-[var(--foreground-muted)]">Fray Intensity</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={frayIntensity}
                onChange={(e) => setFrayIntensity(parseFloat(e.target.value))}
                className="w-24 accent-red-500"
              />
              <span className="text-xs text-red-400 w-8">{(frayIntensity * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        {/* Right Panel - Controls */}
        <div className="w-80 border-l border-[var(--border)] overflow-y-auto">
          {/* Target Selection */}
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visualization Target
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedTarget('location')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${
                  selectedTarget === 'location' 
                    ? 'bg-[var(--accent-blue)]/20 text-[var(--accent-blue)] border border-[var(--accent-blue)]/30' 
                    : 'bg-[var(--background-tertiary)] hover:bg-[var(--background)]'
                }`}
              >
                <MapPin className="w-4 h-4" />
                Location
              </button>
              <button
                onClick={() => setSelectedTarget('character')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm transition-colors ${
                  selectedTarget === 'character' 
                    ? 'bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] border border-[var(--accent-purple)]/30' 
                    : 'bg-[var(--background-tertiary)] hover:bg-[var(--background)]'
                }`}
              >
                <User className="w-4 h-4" />
                Character
              </button>
            </div>
          </div>

          {/* Time States */}
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time States
            </h3>
            <div className="space-y-2">
              {DEFAULT_TIME_STATES.map((state) => (
                <button
                  key={state.id}
                  onClick={() => setCurrentTimeState(state)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    currentTimeState.id === state.id
                      ? 'ring-2 ring-offset-2 ring-offset-[var(--background)]'
                      : 'hover:bg-[var(--background-tertiary)]'
                  }`}
                  style={{
                    backgroundColor: currentTimeState.id === state.id ? state.color + '20' : undefined,
                    borderColor: state.color,
                    // Ring color via CSS variable
                    ['--tw-ring-color' as string]: state.color,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: state.color }}
                    />
                    <span className="font-medium text-sm">{state.label}</span>
                  </div>
                  <p className="text-xs text-[var(--foreground-muted)]">{state.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Fold Patterns */}
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Fold Patterns
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => setActiveFoldPattern(null)}
                className={`w-full p-2 rounded-lg text-left text-sm transition-all ${
                  !activeFoldPattern ? 'bg-[var(--background-tertiary)] text-white' : 'hover:bg-[var(--background-tertiary)] text-[var(--foreground-muted)]'
                }`}
              >
                None (Stable)
              </button>
              {DEFAULT_FOLD_PATTERNS.map((pattern) => (
                <button
                  key={pattern.id}
                  onClick={() => setActiveFoldPattern(pattern)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    activeFoldPattern?.id === pattern.id
                      ? 'bg-purple-500/20 ring-1 ring-purple-500/50'
                      : 'hover:bg-[var(--background-tertiary)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{pattern.name}</span>
                    <span className="text-xs text-purple-400">{(pattern.intensity * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-[var(--foreground-muted)]">{pattern.description}</p>
                  {/* Intensity bar */}
                  <div className="mt-2 h-1 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{ width: `${pattern.intensity * 100}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Settings */}
          {showSettings && (
            <div className="p-4 border-b border-[var(--border)] bg-[var(--background-secondary)]/50">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Visual Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[var(--foreground-muted)] mb-1 block">Chromatic Aberration</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={chromaticAberration}
                    onChange={(e) => setChromaticAberration(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--foreground-muted)] mb-1 block">Noise Level</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={noiseLevel}
                    onChange={(e) => setNoiseLevel(parseFloat(e.target.value))}
                    className="w-full accent-gray-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--foreground-muted)] mb-1 block">Flicker Speed</label>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={flickerSpeed}
                    onChange={(e) => setFlickerSpeed(parseFloat(e.target.value))}
                    className="w-full accent-yellow-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Export Info */}
          <div className="p-4">
            <div className="bg-[var(--accent-gold)]/10 border border-[var(--accent-gold)]/30 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent-gold)] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-[var(--accent-gold)] font-medium">Export to Story</p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">
                    Click the download button to generate a text description of the current Fray/Fold state for use in your stories.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
