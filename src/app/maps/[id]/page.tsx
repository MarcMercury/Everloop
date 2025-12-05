import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MapLab from '@/components/MapLab'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MapEditorPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Fetch map data
  const { data: map, error: mapError } = await supabase
    .from('maps')
    .select('*')
    .eq('id', id)
    .single()

  if (mapError || !map) {
    notFound()
  }

  // Check if user owns the map or it's public
  const isOwner = map.creator_id === user.id
  const canView = isOwner || map.visibility !== 'private'

  if (!canView) {
    notFound()
  }

  // Fetch map elements
  const { data: elements } = await supabase
    .from('map_elements')
    .select('*')
    .eq('map_id', id)

  // Fetch story paths
  const { data: paths } = await supabase
    .from('story_paths')
    .select('*')
    .eq('map_id', id)

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
          <h1 className="text-white font-medium">{map.name}</h1>
          <span className={`px-2 py-0.5 rounded text-xs ${
            map.visibility === 'public_canon' ? 'bg-green-900/50 text-green-400' :
            map.visibility === 'branch_canon' ? 'bg-yellow-900/50 text-yellow-400' :
            'bg-gray-800 text-gray-400'
          }`}>
            {map.visibility.replace('_', ' ')}
          </span>
        </div>
      </header>

      {/* Map Lab */}
      <div className="flex-1">
        <MapLab
          mapId={id}
          initialElements={elements || []}
          initialPaths={paths || []}
          readOnly={!isOwner}
        />
      </div>
    </div>
  )
}
