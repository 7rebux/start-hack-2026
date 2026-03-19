import { Handle, Position } from '@xyflow/react'
import { useNavigate } from 'react-router-dom'
import type { Expert } from '@/data/index'

interface ExpertDetailNodeProps {
  data: Expert & { fieldNames: string[] }
}

export function ExpertDetailNode({ data }: ExpertDetailNodeProps) {
  const navigate = useNavigate()

  return (
    <div className="bg-white border border-emerald-200 rounded-xl shadow-lg p-5 w-[320px]">
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            {data.firstName} {data.lastName}
          </h3>
          <p className="text-xs text-gray-500">{data.title}</p>
        </div>
        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
          Expert
        </span>
      </div>
      {data.about && (
        <p className="text-xs text-gray-600 leading-relaxed mb-3">{data.about}</p>
      )}
      <p className="text-xs text-emerald-600 mb-2">{data.email}</p>
      <div className="flex flex-wrap gap-1.5">
        {data.fieldNames.map(name => (
          <span key={name} className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200">
            {name}
          </span>
        ))}
      </div>
      <button
        onClick={() => navigate(`/schedule/${data.id}`)}
        className="mt-3 w-full text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
      >
        Book interview
      </button>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}
