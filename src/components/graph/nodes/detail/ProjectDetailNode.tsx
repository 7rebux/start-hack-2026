import { Handle, Position } from '@xyflow/react'
import type { Project } from '@/types/entities'

const stateBadge: Record<Project['state'], string> = {
  proposed: 'bg-amber-100 text-amber-700',
  applied: 'bg-blue-100 text-blue-700',
  agreed: 'bg-cyan-100 text-cyan-700',
  in_progress: 'bg-indigo-100 text-indigo-700',
  completed: 'bg-green-100 text-green-700',
  withdrawn: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
}

const stateLabel: Record<Project['state'], string> = {
  proposed: 'Proposed',
  applied: 'Applied',
  agreed: 'Agreed',
  in_progress: 'In Progress',
  completed: 'Completed',
  withdrawn: 'Withdrawn',
  rejected: 'Rejected',
}

interface ProjectDetailNodeProps {
  data: Project
}

export function ProjectDetailNode({ data }: ProjectDetailNodeProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-5 w-[320px]">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-gray-900 leading-snug">{data.title}</h3>
        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          Project
        </span>
      </div>
      <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mb-3 ${stateBadge[data.state]}`}>
        {stateLabel[data.state]}
      </span>
      {data.description && (
        <p className="text-xs text-gray-600 leading-relaxed mb-3">{data.description}</p>
      )}
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}
