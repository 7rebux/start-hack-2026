import { create } from 'zustand'

export type AppView = 'onboarding' | 'graph'
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
  selectedSourceIds: string[]      // university or company IDs, max 3

  // Topic detail / bookmarks
  activeTopicId: string | null
  activeSourceId: string | null
  bookmarkedTopicIds: string[]

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
  setCurrentPanel: (panel: SidebarPanel) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  currentView: 'onboarding',
  currentPanel: 'graph',

  selectedUniversityId: null,
  selectedProgramId: null,

  selectedFieldIds: [],
  selectedSourceIds: [],

  activeTopicId: null,
  activeSourceId: null,
  bookmarkedTopicIds: [],

  setUniversityId: (id) => set({ selectedUniversityId: id, selectedProgramId: null }),

  setProgramId: (id) => set({ selectedProgramId: id }),

  enterGraph: () =>
    set({
      currentView: 'graph',
      currentPanel: 'graph',
      selectedFieldIds: [],
      selectedSourceIds: [],
      activeTopicId: null,
    }),

  goToOnboarding: () => set({ currentView: 'onboarding' }),

  toggleField: (id) => {
    const { selectedFieldIds } = get()
    const isSelected = selectedFieldIds.includes(id)
    let next: string[]

    if (isSelected) {
      next = selectedFieldIds.filter(f => f !== id)
    } else {
      if (selectedFieldIds.length >= 3) return // max 3, ignore
      next = [...selectedFieldIds, id]
    }

    // Always reset sources when fields change
    set({ selectedFieldIds: next, selectedSourceIds: [], activeTopicId: null })
  },

  toggleSource: (id) => {
    const { selectedSourceIds } = get()
    const isSelected = selectedSourceIds.includes(id)
    let next: string[]

    if (isSelected) {
      next = selectedSourceIds.filter(s => s !== id)
    } else {
      next = [...selectedSourceIds, id]
    }

    set({ selectedSourceIds: next, activeTopicId: null })
  },

  setActiveTopic: (id) => set({ activeTopicId: id, activeSourceId: null }),

  setActiveSource: (id) => set({ activeSourceId: id, activeTopicId: null }),

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

// Pure derived selector — 3 levels: fields → sources → topics
export function deriveGraphLevel(state: Pick<AppState, 'selectedFieldIds' | 'selectedSourceIds'>): 1 | 2 | 3 {
  if (state.selectedSourceIds.length > 0) return 3
  if (state.selectedFieldIds.length > 0) return 2
  return 1
}
