import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useAppStore } from '@/store/useAppStore'
import type { TopicGroup } from '@/store/useAppStore'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface TopicGroupNodeProps {
  data: TopicGroup
}

export const TopicGroupNode = memo(function TopicGroupNode({ data }: TopicGroupNodeProps) {
  const { activeGroupIds, enterTopicDetail, setSelectedNode } = useAppStore()
  const isExpanded = activeGroupIds.includes(data.id)

  return (
    <div
      className={`bg-card border rounded-2xl shadow-md p-4 w-[220px] cursor-pointer hover:shadow-lg transition-all ${
        isExpanded ? 'border-primary shadow-lg' : 'border-border hover:border-primary'
      }`}
      onClick={() => {
        enterTopicDetail(data.id)
        setSelectedNode(`group-${data.id}`)
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="ds-label leading-snug">{data.name}</h3>
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            {data.topicIds.length}
          </span>
          {isExpanded ? (
            <ChevronUp className="size-3.5 text-primary" />
          ) : (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </div>
      <p className="ds-caption text-muted-foreground line-clamp-2">{data.description}</p>
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
})
