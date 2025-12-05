'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  LayoutGrid, Map, Sword, BookOpen, User, Feather, Diamond, 
  GitBranch, Zap, Users, ChevronRight, Plus, Clock, Star,
  TrendingUp, Bell, Search, Settings, LogOut, FileText,
  Globe, Layers, Sparkles, RefreshCw
} from 'lucide-react'

interface RecentActivity {
  id: string
  type: 'story' | 'character' | 'quest' | 'lore' | 'map'
  title: string
  action: string
  timestamp: Date
  icon: typeof FileText
}

interface QuickStat {
  label: string
  value: number
  change?: number
  icon: typeof FileText
  color: string
}

const NAVIGATION_SECTIONS = [
  {
    title: 'Creative Tools',
    items: [
      { href: '/write', label: 'Writing Studio', icon: Feather, description: 'Craft your stories', color: 'from-blue-500 to-indigo-500' },
      { href: '/characters', label: 'Character Designer', icon: User, description: 'Build characters', color: 'from-amber-500 to-orange-500' },
      { href: '/quests', label: 'Quest Builder', icon: Sword, description: 'Design quests', color: 'from-purple-500 to-pink-500' },
      { href: '/lore', label: 'LoreForge', icon: BookOpen, description: 'Expand lore', color: 'from-green-500 to-emerald-500' },
    ]
  },
  {
    title: 'World Building',
    items: [
      { href: '/maps', label: 'Map Lab', icon: Map, description: 'Create maps', color: 'from-cyan-500 to-blue-500' },
      { href: '/paths', label: 'Story Paths', icon: GitBranch, description: 'Track connections', color: 'from-violet-500 to-purple-500' },
      { href: '/simulator', label: 'Fray Simulator', icon: RefreshCw, description: 'Visualize instabilities', color: 'from-red-500 to-rose-500' },
    ]
  }
]

const SAMPLE_ACTIVITIES: RecentActivity[] = [
  { id: '1', type: 'story', title: 'The Binding Thread', action: 'Updated chapter 3', timestamp: new Date(Date.now() - 1000 * 60 * 15), icon: FileText },
  { id: '2', type: 'character', title: 'Elder Mira', action: 'Added new trait', timestamp: new Date(Date.now() - 1000 * 60 * 45), icon: User },
  { id: '3', type: 'quest', title: 'The Lost Shard', action: 'Completed design', timestamp: new Date(Date.now() - 1000 * 60 * 120), icon: Sword },
  { id: '4', type: 'lore', title: 'Weaver Origins', action: 'Added timeline entry', timestamp: new Date(Date.now() - 1000 * 60 * 180), icon: BookOpen },
  { id: '5', type: 'map', title: 'Crystal Caverns', action: 'Published map', timestamp: new Date(Date.now() - 1000 * 60 * 240), icon: Map },
]

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString()
}

export default function StoryDeskPage() {
  const [stats, setStats] = useState<QuickStat[]>([
    { label: 'Stories', value: 12, change: 3, icon: FileText, color: 'text-blue-400' },
    { label: 'Characters', value: 47, change: 8, icon: User, color: 'text-amber-400' },
    { label: 'Quests', value: 23, change: 2, icon: Sword, color: 'text-purple-400' },
    { label: 'Lore Entries', value: 156, change: 12, icon: BookOpen, color: 'text-green-400' },
  ])
  const [activities, setActivities] = useState<RecentActivity[]>(SAMPLE_ACTIVITIES)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 bg-[#0a0f1a]/95 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                <Layers className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Story Desk</h1>
                <p className="text-xs text-gray-500">Your creative command center</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search everything..."
                className="pl-10 pr-4 py-2 w-80 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-500 px-1.5 py-0.5 bg-gray-700 rounded">⌘K</kbd>
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" />
            </button>

            {/* Settings */}
            <button className="p-2 rounded-lg hover:bg-gray-800 transition-colors">
              <Settings className="w-5 h-5 text-gray-400" />
            </button>

            {/* User */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-800">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
              <div className="hidden md:block">
                <p className="text-sm font-medium text-white">Creator</p>
                <p className="text-xs text-gray-500">Level 12 Weaver</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto space-y-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <div 
              key={i}
              className="p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                {stat.change && stat.change > 0 && (
                  <span className="flex items-center gap-1 text-xs text-green-400">
                    <TrendingUp className="w-3 h-3" />
                    +{stat.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          <Link
            href="/write"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <Feather className="w-4 h-4" />
            Start Writing
          </Link>
          <Link
            href="/characters/new"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Character
          </Link>
          <Link
            href="/quests/new"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Quest
          </Link>
          <Link
            href="/maps/new"
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            New Map
          </Link>
          <Link
            href="/simulator"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors whitespace-nowrap hover:border-red-500/50"
          >
            <Zap className="w-4 h-4" />
            Fray Analysis
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Navigation Sections */}
          <div className="md:col-span-2 space-y-6">
            {NAVIGATION_SECTIONS.map((section, si) => (
              <div key={si}>
                <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">{section.title}</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {section.items.map((item, ii) => (
                    <Link
                      key={ii}
                      href={item.href}
                      className="group flex items-center gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition-all hover:scale-[1.02]"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0`}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">Recent Activity</h2>
              <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">View All</button>
            </div>
            
            <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
              {activities.map((activity) => (
                <div key={activity.id} className="p-4 flex items-start gap-3 hover:bg-gray-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <activity.icon className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.action}</p>
                  </div>
                  <span className="text-xs text-gray-600">{formatRelativeTime(activity.timestamp)}</span>
                </div>
              ))}
            </div>

            {/* Daily Goal */}
            <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-medium text-white">Daily Goal</span>
              </div>
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                  <span>1,250 / 2,000 words</span>
                  <span>62%</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                    style={{ width: '62%' }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">750 more words to reach your goal!</p>
            </div>

            {/* Canon Status */}
            <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Globe className="w-4 h-4 text-green-400" />
                <span className="text-sm font-medium text-white">Canon Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Approved entries</span>
                  <span className="text-green-400">234</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Pending review</span>
                  <span className="text-yellow-400">12</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">Your contributions</span>
                  <span className="text-blue-400">47</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
