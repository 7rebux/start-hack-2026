import { Handle, Position } from '@xyflow/react'
import type { Supervisor } from '@/data/index'

interface SupervisorDetailNodeProps {
  data: Supervisor & { fieldNames: string[] }
}

export function SupervisorDetailNode({ data }: SupervisorDetailNodeProps) {
  return (
    <div className="bg-white border border-violet-200 rounded-xl shadow-lg p-5 w-[320px]">
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-gray-900">
          {data.title} {data.firstName} {data.lastName}
        </h3>
        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
          Supervisor
        </span>
      </div>
      <p className="text-xs text-violet-600 mb-2">{data.email}</p>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {data.researchInterests.map(interest => (
          <span
            key={interest}
            className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-200"
          >
            {interest.replace(/\b\w/g, c => c.toUpperCase())}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {data.fieldNames.map(name => (
          <span key={name} className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
            {name}
          </span>
        ))}
      </div>

      <a
        href={`mailto:${data.email}`}
        className="mt-3 block w-full text-center text-xs font-medium px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
      >
        Send message
      </a>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}
