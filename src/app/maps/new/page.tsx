import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MapLab from '@/components/MapLab'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function NewMapPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
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
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-gray-400">Creating new map</span>
        </div>
      </header>

      {/* Map Lab */}
      <div className="flex-1">
        <MapLab />
      </div>
    </div>
  )
}
