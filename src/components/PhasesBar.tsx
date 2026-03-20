import { ChevronRight } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { PHASES } from '@/data/phases'

export function PhasesBar() {
  const { currentPhase, setCurrentPhase } = useAppStore()

  return (
    <div className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-border/60 bg-background/75 px-3 py-2 shadow-lg backdrop-blur-md">
        {PHASES.map((phase, idx) => {
          const isActive = currentPhase === phase.id
          return (
            <div key={phase.id} className="flex items-center gap-1">
              {idx > 0 && (
                <ChevronRight className="size-3 shrink-0 text-muted-foreground/30" />
              )}
              <button
                onClick={phase.disabled ? undefined : () => setCurrentPhase(phase.id)}
                disabled={phase.disabled}
                className="rounded-full px-3 py-1 ds-caption font-medium transition-all duration-150"
                style={
                  isActive
                    ? { backgroundColor: phase.color, color: '#fff' }
                    : phase.disabled
                    ? { color: 'var(--muted-foreground)', opacity: 0.4, cursor: 'not-allowed' }
                    : { color: 'var(--muted-foreground)' }
                }
              >
                {phase.name}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
