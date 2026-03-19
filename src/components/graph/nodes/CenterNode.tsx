import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useAppStore } from '@/store/useAppStore'
import { universityById, programsForUniversity } from '@/data/index'

export const CenterNode = memo(function CenterNode() {
  const { selectedUniversityId, selectedProgramId } = useAppStore()
  const university = selectedUniversityId ? universityById[selectedUniversityId] : null
  const program = selectedUniversityId && selectedProgramId
    ? programsForUniversity(selectedUniversityId).find(p => p.id === selectedProgramId)
    : null

  return (
    <div className="relative flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-4 shadow-md min-w-[160px] text-center transition-shadow hover:shadow-lg">
      <div className="ds-badge uppercase tracking-wider text-muted-foreground mb-1">
        {program?.degree ?? 'student'}
      </div>
      <div className="ds-label">{university?.name ?? 'You'}</div>
      {program && (
        <div className="ds-caption text-muted-foreground mt-0.5 max-w-[140px] leading-tight">
          {program.name}
        </div>
      )}
      <Handle type="source" position={Position.Top} className="opacity-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Top} className="opacity-0 !w-0 !h-0" />
    </div>
  )
})
