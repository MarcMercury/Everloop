'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  PenTool,
  Users,
  Map,
  MapPin,
  ArrowRight,
  Sparkles,
  BookOpen,
  Globe,
} from 'lucide-react';

interface CreateOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  bgColor: string;
  available: boolean;
}

const CREATE_OPTIONS: CreateOption[] = [
  {
    id: 'story',
    title: 'Add Story',
    description: 'Write a new story set in the Everloop universe. Your words become part of the living canon.',
    icon: PenTool,
    href: '/write',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
    available: true,
  },
  {
    id: 'character',
    title: 'Add Character',
    description: 'Create a new character with backstory, traits, and connections to existing lore.',
    icon: Users,
    href: '/characters/new',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30',
    available: true,
  },
  {
    id: 'location',
    title: 'Add Location',
    description: 'Define a new place in the Everloop world with details, atmosphere, and significance.',
    icon: MapPin,
    href: '/locations/new',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/30',
    available: true,
  },
  {
    id: 'map',
    title: 'Add Map',
    description: 'Create a visual map connecting locations and showing the geography of your story.',
    icon: Map,
    href: '/maps/new',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30',
    available: true,
  },
];

export default function CreateHubPage() {
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--background)] constellation-bg">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-gold)]/20 to-[var(--accent-purple)]/20 mb-6">
            <Plus className="w-8 h-8 text-[var(--accent-gold)]" />
          </div>
          <h1 className="text-4xl font-serif font-bold mb-4">Create Something New</h1>
          <p className="text-lg text-[var(--foreground-muted)] max-w-xl mx-auto">
            Add to the Everloop universe. Every creation becomes part of the living canon.
          </p>
        </div>

        {/* Create Options Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {CREATE_OPTIONS.map((option) => (
            <Link
              key={option.id}
              href={option.href}
              onMouseEnter={() => setHoveredOption(option.id)}
              onMouseLeave={() => setHoveredOption(null)}
              className={`group relative p-6 rounded-2xl border transition-all duration-300 ${option.bgColor} ${
                !option.available ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl ${option.bgColor} transition-colors`}>
                  <option.icon className={`w-6 h-6 ${option.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-white">{option.title}</h3>
                    <ArrowRight className={`w-4 h-4 ${option.color} transition-transform group-hover:translate-x-1`} />
                  </div>
                  <p className="text-[var(--foreground-muted)] text-sm leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>
              
              {!option.available && (
                <div className="absolute top-4 right-4 px-2 py-1 bg-gray-800 rounded text-xs text-gray-400">
                  Coming Soon
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="bg-[var(--background-secondary)] border border-[var(--border)] rounded-2xl p-6">
          <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[var(--accent-gold)]" />
            Tips for Creating Canon Content
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 bg-[var(--background)] rounded-xl">
              <BookOpen className="w-5 h-5 text-blue-400 mb-2" />
              <h4 className="font-medium text-white mb-1">Know the Lore</h4>
              <p className="text-[var(--foreground-muted)]">
                Explore existing stories and characters before creating to ensure consistency.
              </p>
            </div>
            <div className="p-4 bg-[var(--background)] rounded-xl">
              <Globe className="w-5 h-5 text-green-400 mb-2" />
              <h4 className="font-medium text-white mb-1">Connect to Canon</h4>
              <p className="text-[var(--foreground-muted)]">
                Reference existing locations, characters, or events to weave into the universe.
              </p>
            </div>
            <div className="p-4 bg-[var(--background)] rounded-xl">
              <Users className="w-5 h-5 text-purple-400 mb-2" />
              <h4 className="font-medium text-white mb-1">Build on Others</h4>
              <p className="text-[var(--foreground-muted)]">
                Collaborate with other creators by extending their characters or storylines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
