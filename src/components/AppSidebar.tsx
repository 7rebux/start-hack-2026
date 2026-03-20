import { House, MessageCircle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/useAppStore'
import { universityById, programsForUniversity } from '@/data/index'
import { PHASES } from '@/data/phases'
import studyondLogo from '@/assets/studyond.svg'

export function AppSidebar() {
  const {
    currentPanel,
    currentPhase,
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

  const phase = PHASES.find(p => p.id === currentPhase) ?? PHASES[0]

  return (
    <aside className="flex w-56 flex-col border-r border-border bg-background h-full flex-shrink-0">
      {/* Logo */}
      <div className="flex h-14 items-center px-4 border-b border-border">
        <img src={studyondLogo} alt="Studyond" className="h-5" />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
        {/* Global items */}
        <button
          onClick={goToOnboarding}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ds-label text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
        >
          <House className="size-4 shrink-0" />
          Home
        </button>
        <button
          disabled
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left ds-label text-muted-foreground opacity-40 cursor-not-allowed"
        >
          <MessageCircle className="size-4 shrink-0" />
          Messages
        </button>
        <button
          disabled
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-left ds-label text-muted-foreground opacity-40 cursor-not-allowed"
        >
          <FileText className="size-4 shrink-0" />
          My Thesis
        </button>

        {/* Divider + phase label */}
        <div className="my-2 border-t border-border" />
        <p className="px-3 mb-1 ds-caption font-semibold uppercase tracking-wide" style={{ color: phase.color }}>
          {phase.name}
        </p>

        {/* Phase items */}
        {phase.items.map(item => {
          const isActive = currentPanel === item.panel
          const Icon = item.icon
          return (
            <button
              key={item.panel}
              onClick={() => setCurrentPanel(item.panel)}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors ds-label',
                isActive ? 'font-medium' : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              )}
              style={isActive ? {
                backgroundColor: phase.lightBg,
                color: phase.color,
                borderLeft: `3px solid ${phase.color}`,
              } : {}}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
              {item.panel === 'bookmarks' && bookmarkedTopicIds.length > 0 && (
                <span
                  className="ml-auto flex size-5 items-center justify-center rounded-full ds-caption font-medium text-white"
                  style={{ backgroundColor: phase.color }}
                >
                  {bookmarkedTopicIds.length}
                </span>
              )}
            </button>
          )
        })}
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
