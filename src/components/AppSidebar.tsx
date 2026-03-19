import { Network, Bookmark, Scale } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { universityById, programsForUniversity } from '@/data/index'
import studyondLogo from '@/assets/studyond.svg'

export function AppSidebar() {
  const {
    currentPanel,
    setCurrentPanel,
    bookmarkedTopicIds,
    selectedUniversityId,
    selectedProgramId,
    goToOnboarding,
  } = useAppStore()

  const university = selectedUniversityId ? universityById[selectedUniversityId] : null
  const program = selectedProgramId && selectedUniversityId
    ? programsForUniversity(selectedUniversityId).find(p => p.id === selectedProgramId)
    : null

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-background h-full flex-shrink-0">
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-border">
        <img src={studyondLogo} alt="Studyond" className="h-5" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1">
        <button
          onClick={() => setCurrentPanel('graph')}
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors',
            'ds-label',
            currentPanel === 'graph'
              ? 'bg-secondary text-foreground font-medium'
              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
          )}
        >
          <Network className="size-4 flex-shrink-0" />
          Explore Graph
        </button>

        <button
          onClick={() => setCurrentPanel('bookmarks')}
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors',
            'ds-label',
            currentPanel === 'bookmarks'
              ? 'bg-secondary text-foreground font-medium'
              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
          )}
        >
          <Bookmark className="size-4 flex-shrink-0" />
          Bookmarks
          {bookmarkedTopicIds.length > 0 && (
            <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-foreground text-background ds-caption font-medium">
              {bookmarkedTopicIds.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentPanel('compare')}
          className={cn(
            'flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors',
            'ds-label',
            currentPanel === 'compare'
              ? 'bg-secondary text-foreground font-medium'
              : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
          )}
        >
          <Scale className="size-4 flex-shrink-0" />
          Compare
        </button>
      </nav>

      {/* User info at bottom */}
      {university && (
        <div className="border-t border-border p-3">
          <button
            onClick={goToOnboarding}
            className="w-full rounded-lg p-2 text-left hover:bg-secondary/60 transition-colors"
          >
            <p className="ds-label truncate">{university.name}</p>
            {program && (
              <p className="ds-caption text-muted-foreground truncate mt-0.5">{program.name}</p>
            )}
            <p className="ds-caption text-muted-foreground/60 mt-1">Change →</p>
          </button>
        </div>
      )}
    </aside>
  )
}
