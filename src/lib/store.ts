import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  Profile, 
  Story, 
  StoryMetadata, 
  Arc, 
  Location, 
  Character, 
  TimePeriod,
  StoryType,
  StoryStatus
} from '@/types/database'

interface AuthState {
  user: Profile | null
  isLoading: boolean
  hasAcceptedRules: boolean
  setUser: (user: Profile | null) => void
  setLoading: (loading: boolean) => void
  setHasAcceptedRules: (accepted: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: true,
      hasAcceptedRules: false,
      setUser: (user) => set({ user, hasAcceptedRules: user?.has_accepted_rules ?? false }),
      setLoading: (isLoading) => set({ isLoading }),
      setHasAcceptedRules: (hasAcceptedRules) => set({ hasAcceptedRules }),
      logout: () => set({ user: null, hasAcceptedRules: false }),
    }),
    {
      name: 'everloop-auth',
      partialize: (state) => ({ hasAcceptedRules: state.hasAcceptedRules }),
    }
  )
)

interface EditorState {
  // Current story being edited
  currentStory: Partial<Story> | null
  currentMetadata: Partial<StoryMetadata> | null
  
  // Editor content
  content: string
  cursorPosition: number
  wordCount: number
  
  // AI Assistant
  aiPanelOpen: boolean
  aiSuggestions: AISuggestion[]
  isAiLoading: boolean
  
  // Autosave
  lastSaved: Date | null
  hasUnsavedChanges: boolean
  
  // Actions
  setCurrentStory: (story: Partial<Story> | null) => void
  setCurrentMetadata: (metadata: Partial<StoryMetadata> | null) => void
  setContent: (content: string) => void
  setCursorPosition: (position: number) => void
  setWordCount: (count: number) => void
  toggleAiPanel: () => void
  setAiPanelOpen: (open: boolean) => void
  addAiSuggestion: (suggestion: AISuggestion) => void
  clearAiSuggestions: () => void
  setAiLoading: (loading: boolean) => void
  markSaved: () => void
  setHasUnsavedChanges: (hasChanges: boolean) => void
  resetEditor: () => void
}

export interface AISuggestion {
  id: string
  type: 'paragraph' | 'dialogue' | 'description' | 'worldbuilding' | 'answer'
  content: string
  context?: string
  timestamp: Date
}

const initialEditorState = {
  currentStory: null,
  currentMetadata: null,
  content: '',
  cursorPosition: 0,
  wordCount: 0,
  aiPanelOpen: true,
  aiSuggestions: [],
  isAiLoading: false,
  lastSaved: null,
  hasUnsavedChanges: false,
}

export const useEditorStore = create<EditorState>()((set) => ({
  ...initialEditorState,
  
  setCurrentStory: (currentStory) => set({ currentStory }),
  setCurrentMetadata: (currentMetadata) => set({ currentMetadata }),
  setContent: (content) => {
    const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
    set({ content, wordCount, hasUnsavedChanges: true })
  },
  setCursorPosition: (cursorPosition) => set({ cursorPosition }),
  setWordCount: (wordCount) => set({ wordCount }),
  toggleAiPanel: () => set((state) => ({ aiPanelOpen: !state.aiPanelOpen })),
  setAiPanelOpen: (aiPanelOpen) => set({ aiPanelOpen }),
  addAiSuggestion: (suggestion) => set((state) => ({ 
    aiSuggestions: [...state.aiSuggestions, suggestion] 
  })),
  clearAiSuggestions: () => set({ aiSuggestions: [] }),
  setAiLoading: (isAiLoading) => set({ isAiLoading }),
  markSaved: () => set({ lastSaved: new Date(), hasUnsavedChanges: false }),
  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
  resetEditor: () => set(initialEditorState),
}))

interface StorySetupState {
  // Story setup wizard
  step: number
  storyType: StoryType | null
  selectedArcs: Arc[]
  selectedLocations: Location[]
  selectedCharacters: Character[]
  selectedTimePeriod: TimePeriod | null
  connectionNote: string
  branchFromStoryId: string | null
  storyTitle: string
  
  // Actions
  setStep: (step: number) => void
  setStoryType: (type: StoryType | null) => void
  setSelectedArcs: (arcs: Arc[]) => void
  setSelectedLocations: (locations: Location[]) => void
  setSelectedCharacters: (characters: Character[]) => void
  setSelectedTimePeriod: (period: TimePeriod | null) => void
  setConnectionNote: (note: string) => void
  setBranchFromStoryId: (id: string | null) => void
  setStoryTitle: (title: string) => void
  resetSetup: () => void
}

const initialSetupState = {
  step: 1,
  storyType: null,
  selectedArcs: [],
  selectedLocations: [],
  selectedCharacters: [],
  selectedTimePeriod: null,
  connectionNote: '',
  branchFromStoryId: null,
  storyTitle: '',
}

export const useStorySetupStore = create<StorySetupState>()((set) => ({
  ...initialSetupState,
  
  setStep: (step) => set({ step }),
  setStoryType: (storyType) => set({ storyType }),
  setSelectedArcs: (selectedArcs) => set({ selectedArcs }),
  setSelectedLocations: (selectedLocations) => set({ selectedLocations }),
  setSelectedCharacters: (selectedCharacters) => set({ selectedCharacters }),
  setSelectedTimePeriod: (selectedTimePeriod) => set({ selectedTimePeriod }),
  setConnectionNote: (connectionNote) => set({ connectionNote }),
  setBranchFromStoryId: (branchFromStoryId) => set({ branchFromStoryId }),
  setStoryTitle: (storyTitle) => set({ storyTitle }),
  resetSetup: () => set(initialSetupState),
}))

interface CanonDataState {
  arcs: Arc[]
  locations: Location[]
  characters: Character[]
  timePeriods: TimePeriod[]
  isLoading: boolean
  
  setArcs: (arcs: Arc[]) => void
  setLocations: (locations: Location[]) => void
  setCharacters: (characters: Character[]) => void
  setTimePeriods: (periods: TimePeriod[]) => void
  setLoading: (loading: boolean) => void
}

export const useCanonDataStore = create<CanonDataState>()((set) => ({
  arcs: [],
  locations: [],
  characters: [],
  timePeriods: [],
  isLoading: true,
  
  setArcs: (arcs) => set({ arcs }),
  setLocations: (locations) => set({ locations }),
  setCharacters: (characters) => set({ characters }),
  setTimePeriods: (timePeriods) => set({ timePeriods }),
  setLoading: (isLoading) => set({ isLoading }),
}))

interface UIState {
  // Mobile states
  isMobile: boolean
  mobileAiSheetOpen: boolean
  mobileAnchorsOpen: boolean
  
  // Modal states
  onboardingModalOpen: boolean
  canonReviewModalOpen: boolean
  
  // Actions
  setIsMobile: (isMobile: boolean) => void
  setMobileAiSheetOpen: (open: boolean) => void
  setMobileAnchorsOpen: (open: boolean) => void
  setOnboardingModalOpen: (open: boolean) => void
  setCanonReviewModalOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()((set) => ({
  isMobile: false,
  mobileAiSheetOpen: false,
  mobileAnchorsOpen: false,
  onboardingModalOpen: false,
  canonReviewModalOpen: false,
  
  setIsMobile: (isMobile) => set({ isMobile }),
  setMobileAiSheetOpen: (mobileAiSheetOpen) => set({ mobileAiSheetOpen }),
  setMobileAnchorsOpen: (mobileAnchorsOpen) => set({ mobileAnchorsOpen }),
  setOnboardingModalOpen: (onboardingModalOpen) => set({ onboardingModalOpen }),
  setCanonReviewModalOpen: (canonReviewModalOpen) => set({ canonReviewModalOpen }),
}))
