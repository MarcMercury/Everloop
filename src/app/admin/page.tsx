'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Shield,
  Layers,
  MapPin,
  Users,
  Clock,
  ScrollText,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Arc, Location, Character, TimePeriod, Rule } from '@/types/database';

type TabType = 'arcs' | 'locations' | 'characters' | 'periods' | 'rules';

interface EditingItem {
  id: string | null; // null means new item
  type: TabType;
  data: Record<string, any>;
}

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('arcs');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  
  // Data
  const [arcs, setArcs] = useState<Arc[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [timePeriods, setTimePeriods] = useState<TimePeriod[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const supabase = createClient();
    
    const [arcsRes, locationsRes, charactersRes, periodsRes, rulesRes] = await Promise.all([
      supabase.from('arcs').select('*').order('name'),
      supabase.from('locations').select('*').order('name'),
      supabase.from('characters').select('*').order('name'),
      supabase.from('time_periods').select('*').order('chronological_order'),
      supabase.from('rules').select('*').order('category'),
    ]);

    if (arcsRes.data) setArcs(arcsRes.data);
    if (locationsRes.data) setLocations(locationsRes.data);
    if (charactersRes.data) setCharacters(charactersRes.data);
    if (periodsRes.data) setTimePeriods(periodsRes.data);
    if (rulesRes.data) setRules(rulesRes.data);
    
    setLoading(false);
  }

  async function handleSave() {
    if (!editingItem) return;
    
    setSaving(true);
    const supabase = createClient();
    
    const tableName = getTableName(editingItem.type);
    
    if (editingItem.id) {
      // Update - using type assertion for dynamic table names
      await (supabase
        .from(tableName) as any)
        .update(editingItem.data)
        .eq('id', editingItem.id);
    } else {
      // Insert - using type assertion for dynamic table names
      await (supabase.from(tableName) as any).insert(editingItem.data);
    }
    
    await loadData();
    setEditingItem(null);
    setSaving(false);
  }

  async function handleDelete(type: TabType, id: string) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const supabase = createClient();
    const tableName = getTableName(type);
    
    await (supabase.from(tableName) as any).delete().eq('id', id);
    await loadData();
  }

  function getTableName(type: TabType): string {
    switch (type) {
      case 'arcs': return 'arcs';
      case 'locations': return 'locations';
      case 'characters': return 'characters';
      case 'periods': return 'time_periods';
      case 'rules': return 'rules';
    }
  }

  function startEditing(type: TabType, item?: Record<string, any>) {
    setEditingItem({
      id: item?.id || null,
      type,
      data: item ? { ...item } : getDefaultData(type),
    });
  }

  function getDefaultData(type: TabType): Record<string, any> {
    switch (type) {
      case 'arcs':
        return { name: '', description: '', status: 'open' };
      case 'locations':
        return { name: '', description: '' };
      case 'characters':
        return { name: '', description: '', traits: [], is_locked: false };
      case 'periods':
        return { name: '', description: '', chronological_order: 0 };
      case 'rules':
        return { category: '', rule_text: '' };
    }
  }

  const tabs = [
    { id: 'arcs', label: 'Story Arcs', icon: Layers, count: arcs.length },
    { id: 'locations', label: 'Locations', icon: MapPin, count: locations.length },
    { id: 'characters', label: 'Characters', icon: Users, count: characters.length },
    { id: 'periods', label: 'Time Periods', icon: Clock, count: timePeriods.length },
    { id: 'rules', label: 'Canon Rules', icon: ScrollText, count: rules.length },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] constellation-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-semibold font-serif">Everloop</span>
              </Link>
              <span className="text-[var(--foreground-muted)]">/</span>
              <span className="text-[var(--foreground-muted)]">Admin</span>
            </div>
            <Link href="/dashboard" className="btn-secondary">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <header className="py-8 px-4 sm:px-6 lg:px-8 border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-[var(--accent-gold)]" />
            <h1 className="text-3xl font-serif font-bold">Canon Management</h1>
          </div>
          <p className="text-[var(--foreground-muted)]">
            Manage the universe&apos;s canonical elements: arcs, locations, characters, time periods, and rules.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[240px,1fr] gap-8">
          {/* Sidebar Tabs */}
          <aside>
            <nav className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[var(--background-tertiary)] text-white'
                      : 'hover:bg-[var(--background-secondary)] text-[var(--foreground-muted)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background-secondary)]">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Content Area */}
          <div>
            {/* Tab Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold capitalize">{activeTab.replace('periods', 'Time Periods')}</h2>
              <button
                onClick={() => startEditing(activeTab)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add New
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="card animate-pulse">
                    <div className="h-5 bg-[var(--background-tertiary)] rounded w-1/4 mb-2" />
                    <div className="h-4 bg-[var(--background-tertiary)] rounded w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Arcs List */}
                {activeTab === 'arcs' && arcs.map(arc => (
                  <div key={arc.id} className="card flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{arc.name}</h3>
                        <span className={`badge ${arc.status === 'open' ? 'badge-warning' : 'badge-approved'}`}>
                          {arc.status}
                        </span>
                      </div>
                      {arc.description && (
                        <p className="text-sm text-[var(--foreground-muted)]">{arc.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing('arcs', arc)}
                        className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('arcs', arc.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-[var(--foreground-muted)] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Locations List */}
                {activeTab === 'locations' && locations.map(location => (
                  <div key={location.id} className="card flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{location.name}</h3>
                      {location.description && (
                        <p className="text-sm text-[var(--foreground-muted)]">{location.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing('locations', location)}
                        className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('locations', location.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-[var(--foreground-muted)] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Characters List */}
                {activeTab === 'characters' && characters.map(character => (
                  <div key={character.id} className="card flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{character.name}</h3>
                        {character.is_locked && (
                          <span className="badge badge-error">Locked</span>
                        )}
                      </div>
                      {character.description && (
                        <p className="text-sm text-[var(--foreground-muted)] mb-2">{character.description}</p>
                      )}
                      {character.traits && character.traits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {character.traits.map((trait, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-[var(--background-tertiary)]">
                              {trait}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing('characters', character)}
                        className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('characters', character.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-[var(--foreground-muted)] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Time Periods List */}
                {activeTab === 'periods' && timePeriods.map(period => (
                  <div key={period.id} className="card flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold">{period.name}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--background-tertiary)] text-[var(--foreground-muted)]">
                          Order: {period.chronological_order}
                        </span>
                      </div>
                      {period.description && (
                        <p className="text-sm text-[var(--foreground-muted)]">{period.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing('periods', period)}
                        className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('periods', period.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-[var(--foreground-muted)] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Rules List */}
                {activeTab === 'rules' && rules.map(rule => (
                  <div key={rule.id} className="card flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] uppercase font-semibold">
                          {rule.category}
                        </span>
                      </div>
                      <p className="text-sm text-[var(--foreground)]">{rule.rule_text}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => startEditing('rules', rule)}
                        className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:text-white transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('rules', rule.id)}
                        className="p-2 rounded-lg hover:bg-red-500/20 text-[var(--foreground-muted)] hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {((activeTab === 'arcs' && arcs.length === 0) ||
                  (activeTab === 'locations' && locations.length === 0) ||
                  (activeTab === 'characters' && characters.length === 0) ||
                  (activeTab === 'periods' && timePeriods.length === 0) ||
                  (activeTab === 'rules' && rules.length === 0)) && (
                  <div className="text-center py-12">
                    <p className="text-[var(--foreground-muted)] mb-4">
                      No {activeTab.replace('periods', 'time periods')} yet
                    </p>
                    <button
                      onClick={() => startEditing(activeTab)}
                      className="btn-primary inline-flex items-center gap-2"
                    >
                      <Plus className="w-5 h-5" />
                      Add First {activeTab === 'arcs' ? 'Arc' : activeTab === 'locations' ? 'Location' : activeTab === 'characters' ? 'Character' : activeTab === 'periods' ? 'Time Period' : 'Rule'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--background-secondary)] rounded-xl border border-[var(--border)] max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif font-semibold">
                  {editingItem.id ? 'Edit' : 'Add'} {editingItem.type === 'arcs' ? 'Arc' : editingItem.type === 'locations' ? 'Location' : editingItem.type === 'characters' ? 'Character' : editingItem.type === 'periods' ? 'Time Period' : 'Rule'}
                </h3>
                <button
                  onClick={() => setEditingItem(null)}
                  className="p-2 rounded-lg hover:bg-[var(--background-tertiary)] text-[var(--foreground-muted)] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Arc Fields */}
              {editingItem.type === 'arcs' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={editingItem.data.name || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, name: e.target.value }
                      })}
                      className="w-full"
                      placeholder="Arc name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={editingItem.data.description || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, description: e.target.value }
                      })}
                      className="w-full h-24"
                      placeholder="Describe this story arc"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                      value={editingItem.data.status || 'open'}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, status: e.target.value }
                      })}
                      className="w-full"
                    >
                      <option value="open">Open</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </>
              )}

              {/* Location Fields */}
              {editingItem.type === 'locations' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={editingItem.data.name || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, name: e.target.value }
                      })}
                      className="w-full"
                      placeholder="Location name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={editingItem.data.description || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, description: e.target.value }
                      })}
                      className="w-full h-24"
                      placeholder="Describe this location"
                    />
                  </div>
                </>
              )}

              {/* Character Fields */}
              {editingItem.type === 'characters' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={editingItem.data.name || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, name: e.target.value }
                      })}
                      className="w-full"
                      placeholder="Character name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={editingItem.data.description || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, description: e.target.value }
                      })}
                      className="w-full h-24"
                      placeholder="Describe this character"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Traits (comma-separated)</label>
                    <input
                      type="text"
                      value={(editingItem.data.traits || []).join(', ')}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, traits: e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean) }
                      })}
                      className="w-full"
                      placeholder="brave, kind, mysterious"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_locked"
                      checked={editingItem.data.is_locked || false}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, is_locked: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <label htmlFor="is_locked" className="text-sm">Locked (cannot be modified by contributors)</label>
                  </div>
                </>
              )}

              {/* Time Period Fields */}
              {editingItem.type === 'periods' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <input
                      type="text"
                      value={editingItem.data.name || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, name: e.target.value }
                      })}
                      className="w-full"
                      placeholder="Era or period name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={editingItem.data.description || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, description: e.target.value }
                      })}
                      className="w-full h-24"
                      placeholder="Describe this time period"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Chronological Order</label>
                    <input
                      type="number"
                      value={editingItem.data.chronological_order || 0}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, chronological_order: parseInt(e.target.value) }
                      })}
                      className="w-full"
                      placeholder="0"
                    />
                    <p className="text-xs text-[var(--foreground-muted)] mt-1">Lower numbers come earlier in the timeline</p>
                  </div>
                </>
              )}

              {/* Rule Fields */}
              {editingItem.type === 'rules' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <input
                      type="text"
                      value={editingItem.data.category || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, category: e.target.value }
                      })}
                      className="w-full"
                      placeholder="e.g., Magic, Technology, Society"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Rule</label>
                    <textarea
                      value={editingItem.data.rule_text || ''}
                      onChange={(e) => setEditingItem({
                        ...editingItem,
                        data: { ...editingItem.data, rule_text: e.target.value }
                      })}
                      className="w-full h-32"
                      placeholder="Describe the canon rule"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="p-6 border-t border-[var(--border)] flex justify-end gap-3">
              <button
                onClick={() => setEditingItem(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
