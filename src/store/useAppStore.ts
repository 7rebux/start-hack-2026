import { create } from 'zustand'

export type AppView = 'onboarding' | 'graph'
export type SidebarPanel =
  'graph' | 'bookmarks' | 'compare' | 'search' | 'thesis-graph' |
  'literature' | 'experts' | 'resources' | 'notes' |
  'outline' | 'editor' | 'citations' | 'ai-assist' |
  'checklist' | 'formatting' | 'submission' | 'feedback' |
  'reviews' | 'revisions' | 'publish' | 'archive'

interface AppState {
  // Navigation
  currentView: AppView
  currentPhase: 1 | 2 | 3 | 4 | 5 | 6
  currentPanel: SidebarPanel

  // Onboarding
  selectedUniversityId: string | null
  selectedProgramId: string | null

  // Graph selections
  selectedFieldIds: string[]       // max 1
  selectedSourceIds: string[]      // university or company IDs

  // Topic detail / bookmarks
  activeTopicId: string | null
  activeSourceId: string | null
  bookmarkedTopicIds: string[]     // ordered — index 0 = highest priority
  plannedTopicId: string | null

  // Compare
  compareTopicIds: [string | null, string | null]

  // Field suggestions (from Claude)
  suggestedFieldIds: string[]
  suggestionsLoading: boolean

  // Actions
  setUniversityId: (id: string) => void
  setProgramId: (id: string) => void
  enterGraph: () => void
  goToOnboarding: () => void
  toggleField: (id: string) => void
  toggleSource: (id: string) => void
  setActiveTopic: (id: string | null) => void
  setActiveSource: (id: string | null) => void
  toggleBookmark: (topicId: string) => void
  moveBookmark: (topicId: string, direction: 'up' | 'down') => void
  toggleCompare: (topicId: string) => void
  setCurrentPanel: (panel: SidebarPanel) => void
  setCurrentPhase: (phase: 1 | 2 | 3 | 4 | 5 | 6) => void
  setPlannedTopic: (id: string | null) => void
  setSuggestedFieldIds: (ids: string[]) => void
  setSuggestionsLoading: (v: boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'onboarding',
  currentPhase: 1,
  currentPanel: 'graph',

  selectedUniversityId: null,
  selectedProgramId: null,

  selectedFieldIds: [],
  selectedSourceIds: [],

  activeTopicId: null,
  activeSourceId: null,
  bookmarkedTopicIds: [],
  plannedTopicId: null,
  compareTopicIds: [null, null],

  suggestedFieldIds: [],
  suggestionsLoading: false,

  setUniversityId: (id) => set({ selectedUniversityId: id, selectedProgramId: null, suggestedFieldIds: [], suggestionsLoading: false }),

  setProgramId: (id) => set({ selectedProgramId: id }),

  enterGraph: () =>
    set({
      currentView: 'graph',
      currentPhase: 1,
      currentPanel: 'graph',
      selectedFieldIds: [],
      selectedSourceIds: [],
      activeTopicId: null,
      suggestionsLoading: false,
    }),

  goToOnboarding: () => set({ currentView: 'onboarding' }),

  toggleField: (id) => {
    const { selectedFieldIds } = get()
    const isSelected = selectedFieldIds.includes(id)
    let next: string[]
    if (isSelected) {
      next = selectedFieldIds.filter(f => f !== id)
    } else {
      if (selectedFieldIds.length >= 1) return
      next = [...selectedFieldIds, id]
    }
    set({ selectedFieldIds: next, selectedSourceIds: [], activeTopicId: null })
  },

  toggleSource: (id) => {
    const { selectedSourceIds } = get()
    const isSelected = selectedSourceIds.includes(id)
    const next = isSelected
      ? selectedSourceIds.filter(s => s !== id)
      : [...selectedSourceIds, id]
    set({ selectedSourceIds: next, activeTopicId: null })
  },

  setActiveTopic: (id) => set({ activeTopicId: id, activeSourceId: null }),

  setActiveSource: (id) => set({ activeSourceId: id, activeTopicId: null }),

  toggleBookmark: (topicId) => {
    const { bookmarkedTopicIds, compareTopicIds } = get()
    const isBookmarked = bookmarkedTopicIds.includes(topicId)
    if (isBookmarked) {
      const [a, b] = compareTopicIds
      set({
        bookmarkedTopicIds: bookmarkedTopicIds.filter(id => id !== topicId),
        compareTopicIds: [
          a === topicId ? null : a,
          b === topicId ? null : b,
        ],
      })
    } else {
      set({ bookmarkedTopicIds: [...bookmarkedTopicIds, topicId] })
    }
  },

  moveBookmark: (topicId, direction) => {
    const { bookmarkedTopicIds } = get()
    const idx = bookmarkedTopicIds.indexOf(topicId)
    if (idx === -1) return
    const next = [...bookmarkedTopicIds]
    if (direction === 'up' && idx > 0) {
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
    } else if (direction === 'down' && idx < next.length - 1) {
      ;[next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]
    } else return
    set({ bookmarkedTopicIds: next })
  },

  toggleCompare: (topicId) => {
    const [a, b] = get().compareTopicIds
    if (a === topicId) {
      set({ compareTopicIds: [b, null] })
    } else if (b === topicId) {
      set({ compareTopicIds: [a, null] })
    } else if (!a) {
      set({ compareTopicIds: [topicId, b] })
    } else {
      set({ compareTopicIds: [a, topicId] })
    }
  },

  setCurrentPanel: (panel) => set({ currentPanel: panel }),

  setCurrentPhase: (phase) => {
    const defaultPanels: Record<number, SidebarPanel> = {
      1: 'graph', 2: 'thesis-graph', 3: 'outline', 4: 'checklist', 5: 'reviews',
    }
    set({ currentPhase: phase, currentPanel: defaultPanels[phase], activeTopicId: null, activeSourceId: null })
  },

  setSuggestedFieldIds: (ids) => set({ suggestedFieldIds: ids }),
  setSuggestionsLoading: (v) => set({ suggestionsLoading: v }),
  setPlannedTopic: (id) => set({ plannedTopicId: id }),
}))

// Pure derived selector — 3 levels: fields → sources → topics
export function deriveGraphLevel(state: Pick<AppState, 'selectedFieldIds' | 'selectedSourceIds'>): 1 | 2 | 3 {
  if (state.selectedSourceIds.length > 0) return 3
  if (state.selectedFieldIds.length > 0) return 2
  return 1
}
