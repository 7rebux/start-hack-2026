import type { SidebarPanel } from '@/store/useAppStore'
import type { LucideIcon } from 'lucide-react'
import {
  Network, Bookmark, Scale, Search, Share2,
  BookOpen, Users, FolderOpen, StickyNote,
  ListTree, FileText, Quote, Sparkles,
  CheckSquare, FileCheck, SendHorizontal, MessageSquare,
  Star, GitPullRequest, Globe, Archive,
} from 'lucide-react'

export type PhaseId = 1 | 2 | 3 | 4 | 5 | 6

export interface PhaseItem {
  panel: SidebarPanel
  label: string
  icon: LucideIcon
}

export interface PhaseConfig {
  id: PhaseId
  name: string
  color: string      // hex — used inline for active pill + sidebar accent
  lightBg: string    // rgba — subtle tint for active sidebar item background
  defaultPanel: SidebarPanel
  items: PhaseItem[]
  disabled?: boolean // greyed out in bar — future phases not yet built
}

export const PHASES: PhaseConfig[] = [
  {
    id: 1, name: 'Browse', color: '#2563eb', lightBg: 'rgba(37,99,235,0.10)',
    defaultPanel: 'graph',
    items: [
      { panel: 'graph',        label: 'Explore Graph', icon: Network },
      { panel: 'bookmarks',    label: 'Bookmarks',     icon: Bookmark },
      { panel: 'thesis-graph', label: 'Thesis Graph',  icon: Share2 },
      { panel: 'compare',      label: 'Compare',       icon: Scale },
      { panel: 'search',       label: 'Search',        icon: Search },
    ],
  },
  {
    id: 2, name: 'Select', color: '#0d9488', lightBg: 'rgba(13,148,136,0.10)',
    defaultPanel: 'thesis-graph',
    items: [
      { panel: 'thesis-graph', label: 'Thesis Graph', icon: Share2 },
      { panel: 'literature',   label: 'Literature',   icon: BookOpen },
      { panel: 'experts',      label: 'Experts',      icon: Users },
      { panel: 'resources',    label: 'Resources',    icon: FolderOpen },
      { panel: 'notes',        label: 'Notes',        icon: StickyNote },
    ],
  },
  {
    id: 3, name: 'Research', color: '#d97706', lightBg: 'rgba(217,119,6,0.10)',
    defaultPanel: 'outline',
    items: [
      { panel: 'outline',   label: 'Outline',      icon: ListTree },
      { panel: 'editor',    label: 'Editor',       icon: FileText },
      { panel: 'citations', label: 'Citations',    icon: Quote },
      { panel: 'ai-assist', label: 'AI Assistant', icon: Sparkles },
    ],
  },
  {
    id: 4, name: 'Thesis Companion', color: '#e11d48', lightBg: 'rgba(225,29,72,0.10)',
    defaultPanel: 'checklist',
    disabled: true,
    items: [
      { panel: 'checklist',  label: 'Checklist',  icon: CheckSquare },
      { panel: 'formatting', label: 'Formatting', icon: FileCheck },
      { panel: 'submission', label: 'Submission', icon: SendHorizontal },
      { panel: 'feedback',   label: 'Feedback',   icon: MessageSquare },
    ],
  },
  {
    id: 5, name: 'Submit', color: '#7c3aed', lightBg: 'rgba(124,58,237,0.10)',
    defaultPanel: 'reviews',
    disabled: true,
    items: [
      { panel: 'reviews',   label: 'Reviews',   icon: Star },
      { panel: 'revisions', label: 'Revisions', icon: GitPullRequest },
      { panel: 'publish',   label: 'Publish',   icon: Globe },
      { panel: 'archive',   label: 'Archive',   icon: Archive },
    ],
  },
  {
    id: 6, name: 'Publish', color: '#6b7280', lightBg: 'rgba(107,114,128,0.10)',
    defaultPanel: 'archive',
    disabled: true,
    items: [
      { panel: 'archive', label: 'Archive', icon: Archive },
    ],
  },
]

export function phaseForPanel(panel: SidebarPanel): PhaseConfig {
  return PHASES.find(p => p.items.some(i => i.panel === panel)) ?? PHASES[0]
}
