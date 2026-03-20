import { Handle, Position } from "reactflow"
import type { Student } from "../../types/entities"
import { useActiveNodeId } from "../graph/MultiTopicFlow"

interface StudentNodeProps {
  data: Student
}

export default function StudentNode({ data }: StudentNodeProps) {
  const isActive = useActiveNodeId() === data.id
  return (
    <div className={`bg-white rounded-xl shadow-lg p-5 w-[320px] border-2 transition-colors ${isActive ? "border-sky-500" : "border-sky-200"}`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-gray-900">
          {data.firstName} {data.lastName}
          <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
            {data.degree.toUpperCase()}
          </span>
        </h3>
        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
          Student
        </span>
      </div>
      <p className="text-xs text-sky-600 mb-2">{data.email}</p>

      {data.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {data.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}
