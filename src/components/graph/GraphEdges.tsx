import { AnimatePresence } from 'framer-motion'
import { motion } from 'framer-motion'

export interface NodePosition {
  id: string
  x: number  // center x
  y: number  // center y
}

interface Edge {
  sourceId: string
  targetId: string
}

interface GraphEdgesProps {
  edges: Edge[]
  positions: Record<string, NodePosition>
  canvasHeight: number
  canvasWidth: number
}

function bezierPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1
  const cx1 = x1 + dx * 0.45
  const cx2 = x2 - dx * 0.45
  return `M ${x1},${y1} C ${cx1},${y1} ${cx2},${y2} ${x2},${y2}`
}

export function GraphEdges({ edges, positions, canvasHeight, canvasWidth }: GraphEdgesProps) {
  const validEdges = edges.filter(e => positions[e.sourceId] && positions[e.targetId])

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      width={canvasWidth}
      height={canvasHeight}
      style={{ overflow: 'visible' }}
    >
      <AnimatePresence>
        {validEdges.map(edge => {
          const src = positions[edge.sourceId]
          const tgt = positions[edge.targetId]
          // Offset to right edge of source node and left edge of target node
          const x1 = src.x + 100  // half of node width 200
          const y1 = src.y
          const x2 = tgt.x - 100
          const y2 = tgt.y

          return (
            <motion.path
              key={`${edge.sourceId}-${edge.targetId}`}
              d={bezierPath(x1, y1, x2, y2)}
              stroke="var(--border)"
              strokeWidth={1.5}
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.8 }}
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          )
        })}
      </AnimatePresence>
    </svg>
  )
}
