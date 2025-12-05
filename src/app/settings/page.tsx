'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Mail,
  Save,
  Check,
  Sparkles
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface Profile {
  id: string;
  email: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  role: string;
}

interface Settings {
  emailNotifications: boolean;
  weeklyDigest: boolean;
  storyUpdates: boolean;
  mentionAlerts: boolean;
  darkMode: boolean;
  compactView: boolean;
  showWordCount: boolean;
  autoSave: boolean;
  profilePublic: boolean;
  showActivity: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'appearance' | 'privacy'>('profile');
  
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  
  const [settings, setSettings] = useState<Settings>({
    emailNotifications: true,
    weeklyDigest: true,
    storyUpdates: true,
    mentionAlerts: true,
    darkMode: true,
    compactView: false,
    showWordCount: true,
    autoSave: true,
    profilePublic: true,
    showActivity: true,
  });

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth/login');
        return;
      }
      
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || '');
        setBio(profileData.bio || '');
      }
      
      setLoading(false);
    }
    
    loadProfile();
  }, [router]);

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    const supabase = createClient();
    
    await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        bio: bio,
      })
      .eq('id', profile.id);
    
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const updateSetting = (key: keyof Settings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="animate-pulse text-[var(--gold)]">
          <Sparkles className="w-8 h-8" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="bg-[var(--background-light)] border-b border-[var(--gold)]/20">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link 
            href="/dashboard" 
            className="text-[var(--foreground-muted)] hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold text-[var(--gold)]">Settings</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              {[
                { id: 'profile', icon: User, label: 'Profile' },
                { id: 'notifications', icon: Bell, label: 'Notifications' },
                { id: 'appearance', icon: Palette, label: 'Appearance' },
                { id: 'privacy', icon: Shield, label: 'Privacy' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[var(--gold)]/20 text-[var(--gold)]'
                      : 'text-[var(--foreground-muted)] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-4">Profile Settings</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                        Email
                      </label>
                      <div className="flex items-center gap-2 px-4 py-2 bg-[var(--background-light)] rounded-lg border border-[var(--gold)]/20">
                        <Mail className="w-4 h-4 text-[var(--foreground-muted)]" />
                        <span className="text-[var(--foreground-muted)]">{profile?.email}</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                        Display Name
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-4 py-2 bg-[var(--background-light)] rounded-lg border border-[var(--gold)]/20 text-white focus:outline-none focus:border-[var(--gold)]"
                        placeholder="Your display name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                        Bio
                      </label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-2 bg-[var(--background-light)] rounded-lg border border-[var(--gold)]/20 text-white focus:outline-none focus:border-[var(--gold)] resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                    
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--gold)] text-black rounded-lg font-medium hover:bg-[var(--gold-light)] transition-colors disabled:opacity-50"
                    >
                      {saved ? (
                        <>
                          <Check className="w-4 h-4" />
                          Saved!
                        </>
                      ) : saving ? (
                        'Saving...'
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">Notification Preferences</h2>
                
                {[
                  { key: 'emailNotifications', label: 'Email Notifications', desc: 'Receive email updates about your stories' },
                  { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Get a weekly summary of Everloop activity' },
                  { key: 'storyUpdates', label: 'Story Updates', desc: 'Notifications when stories you follow are updated' },
                  { key: 'mentionAlerts', label: 'Mention Alerts', desc: 'Get notified when someone mentions you' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--background-light)] rounded-lg border border-[var(--gold)]/10">
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => updateSetting(item.key as keyof Settings, !settings[item.key as keyof Settings])}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings[item.key as keyof Settings] ? 'bg-[var(--gold)]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings[item.key as keyof Settings] ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">Appearance Settings</h2>
                
                {[
                  { key: 'darkMode', label: 'Dark Mode', desc: 'Use dark theme (currently always on)' },
                  { key: 'compactView', label: 'Compact View', desc: 'Show more content with smaller spacing' },
                  { key: 'showWordCount', label: 'Show Word Count', desc: 'Display word count while writing' },
                  { key: 'autoSave', label: 'Auto-Save', desc: 'Automatically save your work every 30 seconds' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--background-light)] rounded-lg border border-[var(--gold)]/10">
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => updateSetting(item.key as keyof Settings, !settings[item.key as keyof Settings])}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings[item.key as keyof Settings] ? 'bg-[var(--gold)]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings[item.key as keyof Settings] ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold text-white mb-4">Privacy Settings</h2>
                
                {[
                  { key: 'profilePublic', label: 'Public Profile', desc: 'Allow others to view your creator profile' },
                  { key: 'showActivity', label: 'Show Activity', desc: 'Display your recent activity on your profile' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-[var(--background-light)] rounded-lg border border-[var(--gold)]/10">
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-sm text-[var(--foreground-muted)]">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => updateSetting(item.key as keyof Settings, !settings[item.key as keyof Settings])}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        settings[item.key as keyof Settings] ? 'bg-[var(--gold)]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        settings[item.key as keyof Settings] ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                ))}
                
                <div className="mt-8 pt-6 border-t border-[var(--gold)]/10">
                  <h3 className="text-red-400 font-medium mb-2">Danger Zone</h3>
                  <p className="text-sm text-[var(--foreground-muted)] mb-4">
                    These actions are permanent and cannot be undone.
                  </p>
                  <button className="px-4 py-2 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
