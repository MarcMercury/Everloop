import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QuestBuilder from '@/components/QuestBuilder'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import type { QuestNodeType, QuestType, QuestDifficulty } from '@/types/database'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function QuestEditorPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch quest data
  const { data: quest, error: questError } = await supabase
    .from('quests')
    .select('*')
    .eq('id', id)
    .single()

  if (questError || !quest) {
    notFound()
  }

  // Check if user owns the quest or it's public
  const isOwner = quest.creator_id === user.id
  const canView = isOwner || quest.visibility !== 'private'

  if (!canView) {
    notFound()
  }

  // Fetch quest nodes
  const { data: nodes } = await supabase
    .from('quest_nodes')
    .select('*')
    .eq('quest_id', id)

  // Fetch quest choices (edges)
  const { data: choices } = await supabase
    .from('quest_choices')
    .select('*')

  // Transform nodes to React Flow format
  const flowNodes = (nodes || []).map(node => ({
    id: node.id,
    type: 'questNode',
    position: { x: node.x_position, y: node.y_position },
    data: {
      label: node.title,
      nodeType: node.node_type as QuestNodeType,
      content: node.content || '',
      properties: node.properties || {},
    },
  }))

  // Transform choices to React Flow edges
  const flowEdges = (choices || [])
    .filter(choice => nodes?.some(n => n.id === choice.from_node_id))
    .map(choice => ({
      id: choice.id,
      source: choice.from_node_id,
      target: choice.to_node_id,
      label: choice.choice_text,
      type: 'smoothstep',
      animated: true,
    }))

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
        <div className="ml-4 flex items-center gap-2">
          <h1 className="text-white font-medium">{quest.title}</h1>
          <span className={`px-2 py-0.5 rounded text-xs ${
            quest.visibility === 'public_canon' ? 'bg-green-900/50 text-green-400' :
            quest.visibility === 'branch_canon' ? 'bg-yellow-900/50 text-yellow-400' :
            'bg-gray-800 text-gray-400'
          }`}>
            {quest.visibility.replace('_', ' ')}
          </span>
        </div>
      </header>

      {/* Quest Builder */}
      <div className="flex-1">
        <QuestBuilder
          questId={id}
          initialNodes={flowNodes}
          initialEdges={flowEdges}
          initialQuest={{
            title: quest.title,
            description: quest.description || '',
            questType: quest.quest_type as QuestType,
            difficulty: quest.difficulty as QuestDifficulty,
          }}
          readOnly={!isOwner}
        />
      </div>
    </div>
  )
}
