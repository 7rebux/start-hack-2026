import { create } from 'zustand'
import { supervisorById, companyById } from '@/data/index'

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

    if (next.length === 0) {
      // All fields deselected — full reset downstream
      set({
        selectedFieldIds: next,
        selectedPathways: [],
        selectedSourceIds: [],
        activeTopicId: null,
      })
    } else {
      // Fields changed — keep pathways but reset sources (they may be stale)
      set({
        selectedFieldIds: next,
        selectedSourceIds: [],
        activeTopicId: null,
      })
    }
  },

  togglePathway: (p) => {
    const { selectedPathways, selectedSourceIds } = get()
    const isSelected = selectedPathways.includes(p)
    const next = isSelected
      ? selectedPathways.filter(x => x !== p)
      : [...selectedPathways, p]

    // When a pathway is removed, filter out source IDs that belong only to that pathway
    let filteredSources = selectedSourceIds
    if (isSelected) {
      filteredSources = selectedSourceIds.filter(sid => {
        const isSupervisor = !!supervisorById[sid]
        const isCompany = !!companyById[sid]
        if (p === 'academic' && isSupervisor) {
          // Removing academic — keep this source only if industry is still selected
          return next.includes('industry')
        }
        if (p === 'industry' && isCompany) {
          // Removing industry — keep this source only if academic is still selected
          return next.includes('academic')
        }
        return true
      })
    }

    if (next.length === 0) {
      // All pathways deselected — reset sources too
      set({ selectedPathways: next, selectedSourceIds: [], activeTopicId: null })
    } else {
      set({ selectedPathways: next, selectedSourceIds: filteredSources, activeTopicId: null })
    }
  },

  toggleSource: (id) => {
    const { selectedSourceIds } = get()
    const isSelected = selectedSourceIds.includes(id)
    let next: string[]

    if (isSelected) {
      next = selectedSourceIds.filter(s => s !== id)
    } else {
      if (selectedSourceIds.length >= 3) return // max 3, ignore
      next = [...selectedSourceIds, id]
    }

    set({ selectedSourceIds: next, activeTopicId: null })
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

// Pure derived selector — use this instead of storing graphLevelVisible
export function deriveGraphLevel(state: Pick<AppState, 'selectedFieldIds' | 'selectedPathways' | 'selectedSourceIds'>): 1 | 2 | 3 | 4 {
  if (state.selectedSourceIds.length > 0) return 4
  if (state.selectedPathways.length > 0) return 3
  if (state.selectedFieldIds.length > 0) return 2
  return 1
}
