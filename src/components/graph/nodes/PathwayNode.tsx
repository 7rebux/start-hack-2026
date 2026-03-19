import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { GraduationCap, Building2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'
import type { Pathway } from '@/store/useAppStore'

interface PathwayNodeData {
  pathway: Pathway
  label: string
  description: string
}

export const PathwayNode = memo(function PathwayNode({ data }: { data: PathwayNodeData }) {
  const { selectedPathways, togglePathway } = useAppStore()
  const isSelected = selectedPathways.includes(data.pathway)
  const Icon = data.pathway === 'academic' ? GraduationCap : Building2

  return (
    <div
      onClick={() => togglePathway(data.pathway)}
      className={cn(
        'group flex w-[170px] cursor-pointer flex-col gap-2.5 rounded-xl border px-4 py-4 shadow-sm select-none',
        'transition-all duration-150',
        isSelected
          ? 'border-foreground bg-foreground text-background'
          : 'border-border bg-card text-foreground hover:border-foreground/40 hover:shadow-md hover:scale-[1.03]'
      )}
    >
      <div
        className={cn(
          'flex size-8 items-center justify-center rounded-lg',
          isSelected ? 'bg-background/20' : 'bg-secondary'
        )}
      >
        <Icon
          className="size-4"
          style={{ color: isSelected ? 'var(--background)' : 'var(--muted-foreground)' }}
        />
      </div>
      <div>
        <p
          className="ds-label"
          style={{ color: isSelected ? 'var(--background)' : 'var(--foreground)' }}
        >
          {data.label}
        </p>
        <p
          className="ds-caption mt-0.5 leading-tight"
          style={{ color: isSelected ? 'oklch(0.7 0 0)' : 'var(--muted-foreground)' }}
        >
          {data.description}
        </p>
      </div>
      <Handle type="source" position={Position.Top} className="opacity-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Top} className="opacity-0 !w-0 !h-0" />
    </div>
  )
})
