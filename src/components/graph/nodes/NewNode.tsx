import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Plus } from 'lucide-react'

interface NewNodeProps {
  data: { onOpen: () => void }
}

export const NewNode = memo(function NewNode({ data }: NewNodeProps) {
  return (
    <div
      className="flex items-center justify-center w-16 h-16 rounded-2xl border-2 border-dashed border-border bg-card shadow-sm hover:border-primary hover:bg-accent transition-colors cursor-pointer"
      onClick={data.onOpen}
    >
      <Plus className="size-6 text-muted-foreground" />
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  )
})
