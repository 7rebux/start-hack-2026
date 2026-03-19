import { Handle, Position } from "reactflow";
import type { University } from "../../types/entities";

interface UniversityNodeProps {
  data: University;
}

export default function UniversityNode({ data }: UniversityNodeProps) {
  return (
    <div className="bg-white border border-amber-200 rounded-xl shadow-lg p-5 w-[320px]">
      <Handle type="target" position={Position.Top} className="opacity-0" />

      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-gray-900">{data.name}</h3>
        <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
          University
        </span>
      </div>

{data.about && (
        <p className="text-xs text-gray-600 leading-relaxed mb-3">{data.about}</p>
      )}

      <a
        href={`https://${data.domains[0]}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-amber-600 hover:text-amber-700 hover:underline"
      >
        {data.domains[0]} ↗
      </a>

      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
}
