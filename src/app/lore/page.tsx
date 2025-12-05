'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { ArrowLeft, Plus, Map, Swords, BookOpen } from 'lucide-react'
import LoreForge from '@/components/LoreForge'
import type { LoreEntry, LoreEntryType, MapVisibility } from '@/types/database'

export default function LoreForgePageClient() {
  const [entries, setEntries] = useState<LoreEntry[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchEntries()
  }, [])

  const fetchEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('lore_entries')
      .select('*')
      .or(`creator_id.eq.${user.id},visibility.neq.private`)
      .order('created_at', { ascending: false })

    if (data) {
      setEntries(data as LoreEntry[])
    }
    setLoading(false)
  }

  const handleCreateEntry = async (formData: {
    name: string
    entry_type: LoreEntryType
    summary: string
    content: string
    tags: string[]
    visibility: MapVisibility
  }) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('lore_entries')
      .insert({
        creator_id: user.id,
        name: formData.name,
        entry_type: formData.entry_type,
        summary: formData.summary,
        content: formData.content,
        tags: formData.tags,
        visibility: formData.visibility,
        status: 'draft',
      })
      .select()
      .single()

    if (data) {
      setEntries([data as LoreEntry, ...entries])
    }
  }

  const handleDeleteEntry = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return

    await supabase.from('lore_entries').delete().eq('id', id)
    setEntries(entries.filter(e => e.id !== id))
  }

  const handleViewEntry = (id: string) => {
    window.location.href = `/lore/${id}`
  }

  return (
    <div className="h-screen flex flex-col bg-charcoal">
      {/* Header */}
      <header className="h-14 border-b border-gray-800 flex items-center px-4 bg-navy">
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Dashboard</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <Link
            href="/maps/new"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Map className="w-4 h-4" />
            Map Lab
          </Link>
          <Link
            href="/quests/new"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <Swords className="w-4 h-4" />
            Quest Builder
          </Link>
          <Link
            href="/characters/new"
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Character Designer
          </Link>
        </div>
      </header>

      {/* LoreForge */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <LoreForge
            entries={entries}
            onCreateEntry={handleCreateEntry}
            onDeleteEntry={handleDeleteEntry}
            onViewEntry={handleViewEntry}
          />
        )}
      </div>
    </div>
  )
}
