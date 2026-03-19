import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useAppStore } from '@/store/useAppStore'
import { universities, programsForUniversity } from '@/data/index'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const UniversityProgramNode = memo(function UniversityProgramNode() {
  const { selectedUniversityId, selectedProgramId, setUniversityId, setProgramId } = useAppStore()
  const programs = selectedUniversityId ? programsForUniversity(selectedUniversityId) : []

  return (
    <div className="bg-card border border-border rounded-2xl shadow-md p-4 min-w-[280px]">
      <p className="ds-caption text-muted-foreground mb-3 text-center uppercase tracking-wider">
        Your University & Program
      </p>

      <div className="flex flex-col gap-2">
        <div className="nodrag">
          <Select
            value={selectedUniversityId ?? ''}
            onValueChange={id => setUniversityId(id)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select university…" />
            </SelectTrigger>
            <SelectContent>
              {universities.map(u => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="nodrag">
          <Select
            value={selectedProgramId ?? ''}
            onValueChange={id => setProgramId(id)}
            disabled={!selectedUniversityId}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select program…" />
            </SelectTrigger>
            <SelectContent>
              {programs.map(p => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="opacity-0" />
    </div>
  )
})
