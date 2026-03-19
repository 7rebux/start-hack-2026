import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useAppStore } from '@/store/useAppStore'
import { cn } from '@/lib/utils'

interface FieldNodeData {
  fieldId: string
  label: string
  atMax?: boolean
}

export const FieldNode = memo(function FieldNode({ data }: { data: FieldNodeData }) {
  const { selectedFieldIds, toggleField } = useAppStore()
  const isSelected = selectedFieldIds.includes(data.fieldId)
  const isDisabled = !isSelected && (data.atMax ?? false)

  return (
    <div
      onClick={isDisabled ? undefined : () => toggleField(data.fieldId)}
      className={cn(
        'group relative flex items-center justify-center rounded-xl border px-4 py-2.5 shadow-sm select-none',
        'min-w-[130px] text-center transition-all duration-150',
        isSelected
          ? 'border-foreground bg-foreground text-background cursor-pointer'
          : isDisabled
          ? 'border-border bg-card text-muted-foreground opacity-35 cursor-not-allowed'
          : 'border-border bg-card text-foreground cursor-pointer hover:border-foreground/40 hover:shadow-md hover:scale-[1.03]'
      )}
    >
      <span className="ds-label leading-tight">{data.label}</span>
      <Handle type="source" position={Position.Top} className="opacity-0 !w-0 !h-0" />
      <Handle type="target" position={Position.Top} className="opacity-0 !w-0 !h-0" />
    </div>
  )
})
