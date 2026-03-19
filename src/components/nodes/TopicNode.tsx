import { Handle, Position } from "reactflow"
import type { Topic } from "../../types/topic"

const employmentTypeLabel: Record<string, string> = {
  internship: "Internship",
  working_student: "Working Student",
  graduate_program: "Graduate Program",
  direct_entry: "Direct Entry",
}

const workplaceLabel: Record<string, string> = {
  on_site: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
}

const degreeLabel: Record<string, string> = {
  bsc: "BSc",
  msc: "MSc",
  phd: "PhD",
}

interface TopicNodeProps {
  data: Topic & { fieldNames: string[] }
}

export default function TopicNode({ data }: TopicNodeProps) {
  const isJob = data.type === "job"
  const showEmployment = data.employment === "yes" || data.employment === "open"

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 w-[420px]">
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <h2 className="text-base font-semibold text-gray-900 leading-snug">{data.title}</h2>
        <span
          className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full ${
            isJob
              ? "bg-purple-100 text-purple-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {isJob ? "Job" : "Topic"}
        </span>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed mb-4">{data.description}</p>

      {showEmployment && (
        <div className="flex flex-wrap gap-2 mb-3">
          {data.employment === "open" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
              Employment possible
            </span>
          )}
          {data.employment === "yes" && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
              Employment included
            </span>
          )}
          {data.employmentType && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {employmentTypeLabel[data.employmentType]}
            </span>
          )}
          {data.workplaceType && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {workplaceLabel[data.workplaceType]}
            </span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        {data.degrees.map((d) => (
          <span
            key={d}
            className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-medium"
          >
            {degreeLabel[d]}
          </span>
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {data.fieldNames.map((name) => (
          <span
            key={name}
            className="text-xs px-2 py-0.5 rounded-full bg-gray-50 text-gray-500 border border-gray-200"
          >
            {name}
          </span>
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  )
}
