import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Loader2 } from 'lucide-react'
import type { FieldEntry } from '@/store/useAppStore'

interface FieldEntryNodeProps {
  data: FieldEntry
}

export const FieldEntryNode = memo(function FieldEntryNode({ data }: FieldEntryNodeProps) {
  return (
    <div className="bg-card border border-border rounded-2xl shadow-md px-5 py-3 min-w-[160px] text-center">
      <div className="flex items-center justify-center gap-2">
        {data.loading && <Loader2 className="size-3.5 text-muted-foreground animate-spin shrink-0" />}
        <span className="ds-label">{data.fieldName}</span>
      </div>
      {!data.loading && data.groups.length > 0 && (
        <p className="ds-caption text-muted-foreground mt-0.5">{data.groups.length} clusters</p>
      )}
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
})
