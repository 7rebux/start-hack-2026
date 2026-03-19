import { create } from 'zustand'

export type AppView = 'onboarding' | 'graph'
export type Pathway = 'academic' | 'industry'
export type SidebarPanel = 'graph' | 'bookmarks'

interface AppState {
  // Navigation
  currentView: AppView
  currentPanel: SidebarPanel

  // Onboarding
  selectedUniversityId: string | null
  selectedProgramId: string | null

  // Graph selections
  selectedFieldIds: string[]       // max 3
  selectedPathways: Pathway[]      // academic, industry, or both
  selectedSourceIds: string[]      // supervisor or company IDs, max 3

  // Topic detail / bookmarks
  activeTopicId: string | null
  bookmarkedTopicIds: string[]

  // Graph reveal level (how many columns are visible)
  graphLevelVisible: 1 | 2 | 3 | 4

  // Actions
  setUniversityId: (id: string) => void
  setProgramId: (id: string) => void
  enterGraph: () => void
  goToOnboarding: () => void
  toggleField: (id: string) => void
  togglePathway: (p: Pathway) => void
  toggleSource: (id: string) => void
  setActiveTopic: (id: string | null) => void
  toggleBookmark: (topicId: string) => void
  setCurrentPanel: (panel: SidebarPanel) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'onboarding',
  currentPanel: 'graph',

  selectedUniversityId: null,
  selectedProgramId: null,

  selectedFieldIds: [],
  selectedPathways: [],
  selectedSourceIds: [],

  activeTopicId: null,
  bookmarkedTopicIds: [],

  graphLevelVisible: 1,

  setUniversityId: (id) => set({ selectedUniversityId: id, selectedProgramId: null }),

  setProgramId: (id) => set({ selectedProgramId: id }),

  enterGraph: () =>
    set({
      currentView: 'graph',
      currentPanel: 'graph',
      selectedFieldIds: [],
      selectedPathways: [],
      selectedSourceIds: [],
      activeTopicId: null,
      graphLevelVisible: 1,
    }),

  goToOnboarding: () => set({ currentView: 'onboarding' }),

  toggleField: (id) => {
    const { selectedFieldIds } = get()
    const isSelected = selectedFieldIds.includes(id)
    let next: string[]

    if (isSelected) {
      next = selectedFieldIds.filter(f => f !== id)
    } else {
      if (selectedFieldIds.length >= 3) return // enforced max; caller handles shake
      next = [...selectedFieldIds, id]
    }

    const graphLevelVisible: 1 | 2 | 3 | 4 = next.length > 0 ? 2 : 1
    set({
      selectedFieldIds: next,
      graphLevelVisible,
      // Reset downstream selections when fields change
      selectedPathways: [],
      selectedSourceIds: [],
      activeTopicId: null,
    })
  },

  togglePathway: (p) => {
    const { selectedPathways } = get()
    const isSelected = selectedPathways.includes(p)
    const next = isSelected
      ? selectedPathways.filter(x => x !== p)
      : [...selectedPathways, p]

    const graphLevelVisible: 1 | 2 | 3 | 4 = next.length > 0 ? 3 : 2
    set({
      selectedPathways: next,
      graphLevelVisible,
      selectedSourceIds: [],
      activeTopicId: null,
    })
  },

  toggleSource: (id) => {
    const { selectedSourceIds } = get()
    const isSelected = selectedSourceIds.includes(id)
    let next: string[]

    if (isSelected) {
      next = selectedSourceIds.filter(s => s !== id)
    } else {
      if (selectedSourceIds.length >= 3) return
      next = [...selectedSourceIds, id]
    }

    const graphLevelVisible: 1 | 2 | 3 | 4 = next.length > 0 ? 4 : 3
    set({
      selectedSourceIds: next,
      graphLevelVisible,
      activeTopicId: null,
    })
  },

  setActiveTopic: (id) => set({ activeTopicId: id }),

  toggleBookmark: (topicId) => {
    const { bookmarkedTopicIds } = get()
    const isBookmarked = bookmarkedTopicIds.includes(topicId)
    set({
      bookmarkedTopicIds: isBookmarked
        ? bookmarkedTopicIds.filter(id => id !== topicId)
        : [...bookmarkedTopicIds, topicId],
    })
  },

  setCurrentPanel: (panel) => set({ currentPanel: panel }),
}))
