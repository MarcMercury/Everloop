'use client'

import { useState } from 'react'
import { 
  User, Sparkles, Shield, Zap, Heart, Eye, Flame, Wind, 
  Moon, Sun, Star, Crown, Skull, Ghost, Wand2, BookOpen,
  Save, Upload, RefreshCw, ChevronDown, ChevronUp, Plus, X
} from 'lucide-react'
import type { PathRole, ThreatLevel } from '@/types/database'

interface CharacterFormData {
  name: string
  origin: string
  path_role: PathRole
  shard_alignment: { name: string; affinity: number }[]
  emotional_arc: string
  physical_description: string
  fray_behavior: string
  abilities: string[]
  portrait_url: string
  visibility: 'private' | 'branch_canon' | 'public_canon'
}

interface CreatureFormData {
  name: string
  species_name: string
  is_species: boolean
  description: string
  habitat: string
  behavior: string
  fray_behavior: string
  threat_level: ThreatLevel
  abilities: string[]
  weaknesses: string[]
  image_url: string
  visibility: 'private' | 'branch_canon' | 'public_canon'
}

const PATH_ROLES: { value: PathRole; label: string; description: string; icon: typeof User; color: string }[] = [
  { value: 'dreamer', label: 'Dreamer', description: 'Those who see beyond the veil of reality', icon: Moon, color: '#8b5cf6' },
  { value: 'lantern', label: 'Lantern', description: 'Bearers of light in the darkness', icon: Sun, color: '#f59e0b' },
  { value: 'weaver', label: 'Weaver', description: 'Manipulators of the cosmic threads', icon: Wand2, color: '#3b82f6' },
  { value: 'folded', label: 'Folded', description: 'Touched by temporal distortion', icon: RefreshCw, color: '#06b6d4' },
  { value: 'unbound', label: 'Unbound', description: 'Free from the cosmic order', icon: Wind, color: '#22c55e' },
  { value: 'herald', label: 'Herald', description: 'Speakers for greater powers', icon: Crown, color: '#ec4899' },
  { value: 'keeper', label: 'Keeper', description: 'Guardians of ancient knowledge', icon: BookOpen, color: '#f97316' },
  { value: 'wanderer', label: 'Wanderer', description: 'Travelers between realms', icon: Star, color: '#6366f1' },
  { value: 'other', label: 'Other', description: 'Unique path outside categories', icon: Sparkles, color: '#6b7280' },
]

const THREAT_LEVELS: { value: ThreatLevel; label: string; color: string }[] = [
  { value: 'harmless', label: 'Harmless', color: '#22c55e' },
  { value: 'low', label: 'Low', color: '#84cc16' },
  { value: 'moderate', label: 'Moderate', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'extreme', label: 'Extreme', color: '#ef4444' },
  { value: 'legendary', label: 'Legendary', color: '#8b5cf6' },
]

const SHARDS = [
  { name: 'Memory', color: '#3b82f6' },
  { name: 'Time', color: '#06b6d4' },
  { name: 'Form', color: '#22c55e' },
  { name: 'Void', color: '#6b7280' },
  { name: 'Flame', color: '#ef4444' },
  { name: 'Dream', color: '#8b5cf6' },
  { name: 'Truth', color: '#f59e0b' },
  { name: 'Binding', color: '#ec4899' },
]

type Mode = 'character' | 'creature'

interface CharacterDesignerProps {
  mode?: Mode
  initialCharacter?: Partial<CharacterFormData>
  initialCreature?: Partial<CreatureFormData>
  onSaveCharacter?: (data: CharacterFormData) => void
  onSaveCreature?: (data: CreatureFormData) => void
  onGeneratePortrait?: () => void
}

export default function CharacterDesigner({
  mode: initialMode = 'character',
  initialCharacter,
  initialCreature,
  onSaveCharacter,
  onSaveCreature,
  onGeneratePortrait,
}: CharacterDesignerProps) {
  const [mode, setMode] = useState<Mode>(initialMode)
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic', 'path', 'appearance'])
  
  const [characterData, setCharacterData] = useState<CharacterFormData>({
    name: initialCharacter?.name || '',
    origin: initialCharacter?.origin || '',
    path_role: initialCharacter?.path_role || 'dreamer',
    shard_alignment: initialCharacter?.shard_alignment || [],
    emotional_arc: initialCharacter?.emotional_arc || '',
    physical_description: initialCharacter?.physical_description || '',
    fray_behavior: initialCharacter?.fray_behavior || '',
    abilities: initialCharacter?.abilities || [],
    portrait_url: initialCharacter?.portrait_url || '',
    visibility: initialCharacter?.visibility || 'private',
  })
  
  const [creatureData, setCreatureData] = useState<CreatureFormData>({
    name: initialCreature?.name || '',
    species_name: initialCreature?.species_name || '',
    is_species: initialCreature?.is_species || false,
    description: initialCreature?.description || '',
    habitat: initialCreature?.habitat || '',
    behavior: initialCreature?.behavior || '',
    fray_behavior: initialCreature?.fray_behavior || '',
    threat_level: initialCreature?.threat_level || 'moderate',
    abilities: initialCreature?.abilities || [],
    weaknesses: initialCreature?.weaknesses || [],
    image_url: initialCreature?.image_url || '',
    visibility: initialCreature?.visibility || 'private',
  })

  const [abilityInput, setAbilityInput] = useState('')
  const [weaknessInput, setWeaknessInput] = useState('')

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const addAbility = (isCreature: boolean) => {
    if (!abilityInput.trim()) return
    if (isCreature) {
      setCreatureData({ ...creatureData, abilities: [...creatureData.abilities, abilityInput.trim()] })
    } else {
      setCharacterData({ ...characterData, abilities: [...characterData.abilities, abilityInput.trim()] })
    }
    setAbilityInput('')
  }

  const removeAbility = (index: number, isCreature: boolean) => {
    if (isCreature) {
      setCreatureData({ ...creatureData, abilities: creatureData.abilities.filter((_, i) => i !== index) })
    } else {
      setCharacterData({ ...characterData, abilities: characterData.abilities.filter((_, i) => i !== index) })
    }
  }

  const addWeakness = () => {
    if (!weaknessInput.trim()) return
    setCreatureData({ ...creatureData, weaknesses: [...creatureData.weaknesses, weaknessInput.trim()] })
    setWeaknessInput('')
  }

  const removeWeakness = (index: number) => {
    setCreatureData({ ...creatureData, weaknesses: creatureData.weaknesses.filter((_, i) => i !== index) })
  }

  const toggleShardAlignment = (shardName: string) => {
    const existing = characterData.shard_alignment.find(s => s.name === shardName)
    if (existing) {
      setCharacterData({
        ...characterData,
        shard_alignment: characterData.shard_alignment.filter(s => s.name !== shardName)
      })
    } else {
      setCharacterData({
        ...characterData,
        shard_alignment: [...characterData.shard_alignment, { name: shardName, affinity: 50 }]
      })
    }
  }

  const updateShardAffinity = (shardName: string, affinity: number) => {
    setCharacterData({
      ...characterData,
      shard_alignment: characterData.shard_alignment.map(s =>
        s.name === shardName ? { ...s, affinity } : s
      )
    })
  }

  const Section = ({ id, title, icon: Icon, children }: { id: string; title: string; icon: typeof User; children: React.ReactNode }) => (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center justify-between p-4 bg-navy hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-white">{title}</span>
        </div>
        {expandedSections.includes(id) ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>
      {expandedSections.includes(id) && (
        <div className="p-4 bg-charcoal border-t border-gray-700 space-y-4">
          {children}
        </div>
      )}
    </div>
  )

  return (
    <div className="h-full flex bg-charcoal">
      {/* Left Panel - Form */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 mb-6 p-1 bg-navy rounded-lg w-fit">
            <button
              onClick={() => setMode('character')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                mode === 'character' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Character
            </button>
            <button
              onClick={() => setMode('creature')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                mode === 'creature' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Skull className="w-4 h-4" />
              Creature
            </button>
          </div>

          <div className="space-y-4">
            {mode === 'character' ? (
              <>
                {/* Basic Info */}
                <Section id="basic" title="Basic Information" icon={User}>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={characterData.name}
                      onChange={(e) => setCharacterData({ ...characterData, name: e.target.value })}
                      className="w-full px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Character name..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Origin</label>
                    <input
                      type="text"
                      value={characterData.origin}
                      onChange={(e) => setCharacterData({ ...characterData, origin: e.target.value })}
                      className="w-full px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Where do they come from?"
                    />
                  </div>
                </Section>

                {/* Path Role */}
                <Section id="path" title="Path Role" icon={Crown}>
                  <div className="grid grid-cols-3 gap-2">
                    {PATH_ROLES.map(role => {
                      const Icon = role.icon
                      const isSelected = characterData.path_role === role.value
                      return (
                        <button
                          key={role.value}
                          onClick={() => setCharacterData({ ...characterData, path_role: role.value })}
                          className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                            isSelected ? '' : 'border-gray-700 hover:border-gray-600'
                          }`}
                          style={isSelected ? { 
                            borderColor: role.color,
                            backgroundColor: role.color + '15'
                          } : {}}
                        >
                          <Icon 
                            className="w-6 h-6" 
                            style={{ color: isSelected ? role.color : '#9ca3af' }} 
                          />
                          <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                            {role.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {PATH_ROLES.find(r => r.value === characterData.path_role)?.description}
                  </p>
                </Section>

                {/* Shard Alignment */}
                <Section id="shards" title="Shard Alignment" icon={Sparkles}>
                  <p className="text-sm text-gray-400 mb-3">Select shards this character has affinity with:</p>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {SHARDS.map(shard => {
                      const isSelected = characterData.shard_alignment.some(s => s.name === shard.name)
                      return (
                        <button
                          key={shard.name}
                          onClick={() => toggleShardAlignment(shard.name)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                            isSelected ? 'border-2' : 'border-gray-700 hover:border-gray-600'
                          }`}
                          style={isSelected ? { 
                            borderColor: shard.color,
                            backgroundColor: shard.color + '15'
                          } : {}}
                        >
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: shard.color }}
                          />
                          <span className={`text-sm ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                            {shard.name}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                  {characterData.shard_alignment.length > 0 && (
                    <div className="space-y-3">
                      {characterData.shard_alignment.map(shard => {
                        const shardConfig = SHARDS.find(s => s.name === shard.name)
                        return (
                          <div key={shard.name} className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: shardConfig?.color }}
                            />
                            <span className="text-sm text-gray-300 w-20">{shard.name}</span>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={shard.affinity}
                              onChange={(e) => updateShardAffinity(shard.name, parseInt(e.target.value))}
                              className="flex-1"
                            />
                            <span className="text-sm text-gray-400 w-12">{shard.affinity}%</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Section>

                {/* Appearance */}
                <Section id="appearance" title="Physical Description" icon={Eye}>
                  <textarea
                    value={characterData.physical_description}
                    onChange={(e) => setCharacterData({ ...characterData, physical_description: e.target.value })}
                    className="w-full px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={4}
                    placeholder="Describe their appearance..."
                  />
                </Section>

                {/* Emotional Arc */}
                <Section id="emotional" title="Emotional Arc" icon={Heart}>
                  <textarea
                    value={characterData.emotional_arc}
                    onChange={(e) => setCharacterData({ ...characterData, emotional_arc: e.target.value })}
                    className="w-full px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="What is their emotional journey?"
                  />
                </Section>

                {/* Fray Behavior */}
                <Section id="fray" title="Fray Behavior" icon={Zap}>
                  <textarea
                    value={characterData.fray_behavior}
                    onChange={(e) => setCharacterData({ ...characterData, fray_behavior: e.target.value })}
                    className="w-full px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                    placeholder="How do they behave when exposed to the Fray?"
                  />
                </Section>

                {/* Abilities */}
                <Section id="abilities" title="Abilities" icon={Flame}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {characterData.abilities.map((ability, index) => (
                      <span 
                        key={index} 
                        className="flex items-center gap-1 px-3 py-1 bg-blue-900/30 border border-blue-700/50 rounded-full text-sm text-blue-300"
                      >
                        {ability}
                        <button onClick={() => removeAbility(index, false)} className="ml-1 text-blue-400 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={abilityInput}
                      onChange={(e) => setAbilityInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAbility(false)}
                      className="flex-1 px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add ability..."
                    />
                    <button
                      onClick={() => addAbility(false)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </Section>
              </>
            ) : (
              <>
                {/* Creature Basic Info */}
                <Section id="basic" title="Basic Information" icon={Skull}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Name</label>
                      <input
                        type="text"
                        value={creatureData.name}
                        onChange={(e) => setCreatureData({ ...creatureData, name: e.target.value })}
                        className="w-full px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Creature name..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Species Name</label>
                      <input
                        type="text"
                        value={creatureData.species_name}
                        onChange={(e) => setCreatureData({ ...creatureData, species_name: e.target.value })}
                        className="w-full px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Species name (if applicable)..."
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 mt-3">
                    <input
                      type="checkbox"
                      checked={creatureData.is_species}
                      onChange={(e) => setCreatureData({ ...creatureData, is_species: e.target.checked })}
                      className="rounded border-gray-700 bg-navy text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-300">This is a species template (not an individual)</span>
                  </label>
                </Section>

                {/* Threat Level */}
                <Section id="threat" title="Threat Level" icon={Shield}>
                  <div className="flex gap-2">
                    {THREAT_LEVELS.map(level => (
                      <button
                        key={level.value}
                        onClick={() => setCreatureData({ ...creatureData, threat_level: level.value })}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 transition-all text-sm ${
                          creatureData.threat_level === level.value ? '' : 'border-gray-700'
                        }`}
                        style={creatureData.threat_level === level.value ? { 
                          borderColor: level.color,
                          backgroundColor: level.color + '15',
                          color: level.color
                        } : { color: '#9ca3af' }}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </Section>

                {/* Description & Habitat */}
                <Section id="description" title="Description & Habitat" icon={Eye}>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Description</label>
                    <textarea
                      value={creatureData.description}
                      onChange={(e) => setCreatureData({ ...creatureData, description: e.target.value })}
                      className="w-full px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={3}
                      placeholder="Describe the creature..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Habitat</label>
                    <input
                      type="text"
                      value={creatureData.habitat}
                      onChange={(e) => setCreatureData({ ...creatureData, habitat: e.target.value })}
                      className="w-full px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Where does it live?"
                    />
                  </div>
                </Section>

                {/* Behavior */}
                <Section id="behavior" title="Behavior" icon={Ghost}>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Normal Behavior</label>
                    <textarea
                      value={creatureData.behavior}
                      onChange={(e) => setCreatureData({ ...creatureData, behavior: e.target.value })}
                      className="w-full px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                      placeholder="How does it normally behave?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Fray Behavior</label>
                    <textarea
                      value={creatureData.fray_behavior}
                      onChange={(e) => setCreatureData({ ...creatureData, fray_behavior: e.target.value })}
                      className="w-full px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                      rows={2}
                      placeholder="How does it behave in the Fray?"
                    />
                  </div>
                </Section>

                {/* Abilities */}
                <Section id="abilities" title="Abilities" icon={Flame}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {creatureData.abilities.map((ability, index) => (
                      <span 
                        key={index} 
                        className="flex items-center gap-1 px-3 py-1 bg-red-900/30 border border-red-700/50 rounded-full text-sm text-red-300"
                      >
                        {ability}
                        <button onClick={() => removeAbility(index, true)} className="ml-1 text-red-400 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={abilityInput}
                      onChange={(e) => setAbilityInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addAbility(true)}
                      className="flex-1 px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add ability..."
                    />
                    <button
                      onClick={() => addAbility(true)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </Section>

                {/* Weaknesses */}
                <Section id="weaknesses" title="Weaknesses" icon={Shield}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {creatureData.weaknesses.map((weakness, index) => (
                      <span 
                        key={index} 
                        className="flex items-center gap-1 px-3 py-1 bg-yellow-900/30 border border-yellow-700/50 rounded-full text-sm text-yellow-300"
                      >
                        {weakness}
                        <button onClick={() => removeWeakness(index)} className="ml-1 text-yellow-400 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={weaknessInput}
                      onChange={(e) => setWeaknessInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addWeakness()}
                      className="flex-1 px-4 py-2 bg-navy border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add weakness..."
                    />
                    <button
                      onClick={addWeakness}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-white transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </Section>
              </>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => mode === 'character' ? onSaveCharacter?.(characterData) : onSaveCreature?.(creatureData)}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              Save {mode === 'character' ? 'Character' : 'Creature'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Portrait Preview */}
      <div className="w-80 bg-navy border-l border-gray-800 p-6 flex flex-col">
        <h3 className="text-lg font-semibold text-white mb-4">Portrait</h3>
        
        <div className="aspect-square bg-charcoal rounded-xl border-2 border-dashed border-gray-700 flex items-center justify-center mb-4">
          {(mode === 'character' ? characterData.portrait_url : creatureData.image_url) ? (
            <img 
              src={mode === 'character' ? characterData.portrait_url : creatureData.image_url} 
              alt="Portrait" 
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <div className="text-center">
              <User className="w-16 h-16 text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No portrait</p>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button
            onClick={onGeneratePortrait}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium transition-colors"
          >
            <Sparkles className="w-5 h-5" />
            AI Generate Portrait
          </button>
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition-colors">
            <Upload className="w-5 h-5" />
            Upload Image
          </button>
        </div>

        {/* AI Prompt for Bestiary */}
        {mode === 'creature' && creatureData.name && (
          <div className="mt-6 p-4 bg-purple-900/20 rounded-lg border border-purple-700/50">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">AI Suggestion</span>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              Would you like to make "{creatureData.name}" an official species entry in the Everloop Bestiary?
            </p>
            <button className="w-full px-3 py-2 text-sm bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
              Add to Bestiary
            </button>
          </div>
        )}

        {/* Character Summary */}
        {mode === 'character' && characterData.name && (
          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium text-gray-400">Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="text-white">{characterData.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Path</span>
                <span className="text-white capitalize">{characterData.path_role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shards</span>
                <span className="text-white">{characterData.shard_alignment.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Abilities</span>
                <span className="text-white">{characterData.abilities.length || 0}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
