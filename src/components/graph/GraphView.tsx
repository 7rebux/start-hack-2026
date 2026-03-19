import { useRef, useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GraduationCap, Building2, Bookmark, BookmarkCheck } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import {
  fields,
  supervisorsForFields,
  companiesForFields,
  topicsForSourcesAndFields,
  companyById,
  supervisorById,
  degreeLabel,
} from '@/data/index'
import { GraphNode, PathwayNode, nodeVariants } from './GraphNode'
import { GraphEdges } from './GraphEdges'
import type { NodePosition } from './GraphEdges'
import { cn } from '@/lib/utils'

const NODE_HEIGHT = 68
const NODE_GAP = 10
const COL_WIDTH = 200
const COL_GAP = 120
const CANVAS_PADDING_X = 48
const CANVAS_PADDING_Y = 48

function computeColumnX(colIndex: number): number {
  return CANVAS_PADDING_X + colIndex * (COL_WIDTH + COL_GAP) + COL_WIDTH / 2
}

function computeNodePositions(
  nodeIds: string[],
  colIndex: number,
  canvasHeight: number
): Record<string, NodePosition> {
  const totalH = nodeIds.length * NODE_HEIGHT + Math.max(0, nodeIds.length - 1) * NODE_GAP
  const startY = Math.max(CANVAS_PADDING_Y, (canvasHeight - totalH) / 2)
  const cx = computeColumnX(colIndex)
  const result: Record<string, NodePosition> = {}
  nodeIds.forEach((id, i) => {
    result[id] = {
      id,
      x: cx,
      y: startY + i * (NODE_HEIGHT + NODE_GAP) + NODE_HEIGHT / 2,
    }
  })
  return result
}

const columnTransition = { duration: 0.35, ease: 'easeOut' as const }
const columnInitial = { opacity: 0, x: 40 }
const columnAnimate = { opacity: 1, x: 0 }
const columnExit = { opacity: 0, x: -20, transition: { duration: 0.2 } }

interface GraphColumnProps {
  title: string
  hint?: string
  children: React.ReactNode
}

function GraphColumn({ title, hint, children }: GraphColumnProps) {
  return (
    <motion.div
      initial={columnInitial}
      animate={columnAnimate}
      exit={columnExit}
      transition={columnTransition}
      className="flex flex-col gap-3"
    >
      <div className="mb-1">
        <p className="ds-label text-foreground">{title}</p>
        {hint && <p className="ds-caption text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.04 } } }}
        className="flex flex-col gap-2.5"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}

export function GraphView() {
  const {
    selectedFieldIds,
    selectedPathways,
    selectedSourceIds,
    activeTopicId,
    bookmarkedTopicIds,
    graphLevelVisible,
    toggleField,
    togglePathway,
    toggleSource,
    setActiveTopic,
    toggleBookmark,
  } = useAppStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = useState(600)
  const [shakeFieldId, setShakeFieldId] = useState<string | null>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Derived data
  const sourceNodes =
    selectedPathways.includes('academic') && selectedPathways.includes('industry')
      ? [
          ...supervisorsForFields(selectedFieldIds).slice(0, 8),
          ...companiesForFields(selectedFieldIds).slice(0, 6),
        ]
      : selectedPathways.includes('academic')
      ? supervisorsForFields(selectedFieldIds).slice(0, 10)
      : selectedPathways.includes('industry')
      ? companiesForFields(selectedFieldIds).slice(0, 10)
      : []

  const topicNodes = topicsForSourcesAndFields(
    selectedSourceIds,
    selectedFieldIds,
    selectedPathways
  ).slice(0, 15)

  // Compute node positions for SVG edges
  const canvasHeight = Math.max(
    containerHeight,
    CANVAS_PADDING_Y * 2 + fields.length * (NODE_HEIGHT + NODE_GAP)
  )

  const fieldPositions = computeNodePositions(
    fields.map(f => f.id),
    0,
    canvasHeight
  )
  const pathwayPositions = computeNodePositions(['academic', 'industry'], 1, canvasHeight)
  const sourcePositions = computeNodePositions(
    sourceNodes.map(s => s.id),
    2,
    canvasHeight
  )
  const topicPositions = computeNodePositions(
    topicNodes.map(t => t.id),
    3,
    canvasHeight
  )

  const allPositions: Record<string, NodePosition> = {
    ...fieldPositions,
    ...pathwayPositions,
    ...sourcePositions,
    ...topicPositions,
  }

  // Build edges
  const edges: { sourceId: string; targetId: string }[] = []
  // L1 → L2
  if (graphLevelVisible >= 2) {
    for (const fid of selectedFieldIds) {
      for (const p of selectedPathways) {
        edges.push({ sourceId: fid, targetId: p })
      }
    }
  }
  // L2 → L3
  if (graphLevelVisible >= 3) {
    for (const p of selectedPathways) {
      for (const src of sourceNodes) {
        const isAcademic = supervisorById[src.id] !== undefined
        const isIndustry = companyById[src.id] !== undefined
        if (p === 'academic' && isAcademic && selectedSourceIds.includes(src.id)) {
          edges.push({ sourceId: p, targetId: src.id })
        }
        if (p === 'industry' && isIndustry && selectedSourceIds.includes(src.id)) {
          edges.push({ sourceId: p, targetId: src.id })
        }
      }
    }
  }
  // L3 → L4
  if (graphLevelVisible >= 4) {
    for (const topic of topicNodes) {
      for (const sid of selectedSourceIds) {
        if (
          topic.supervisorIds.includes(sid) ||
          topic.companyId === sid
        ) {
          edges.push({ sourceId: sid, targetId: topic.id })
        }
      }
    }
  }

  const numColumns = graphLevelVisible
  const canvasWidth =
    CANVAS_PADDING_X * 2 + numColumns * COL_WIDTH + (numColumns - 1) * COL_GAP

  const handleFieldClick = useCallback(
    (fieldId: string) => {
      if (!selectedFieldIds.includes(fieldId) && selectedFieldIds.length >= 3) {
        setShakeFieldId(fieldId)
        setTimeout(() => setShakeFieldId(null), 500)
        return
      }
      toggleField(fieldId)
    },
    [selectedFieldIds, toggleField]
  )

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-auto">
      {/* SVG edge layer */}
      <GraphEdges
        edges={edges}
        positions={allPositions}
        canvasHeight={canvasHeight}
        canvasWidth={Math.max(canvasWidth, 1400)}
      />

      {/* Column layout */}
      <div
        className="relative flex items-start gap-0 px-12 py-12"
        style={{ minWidth: `${Math.max(canvasWidth, 1400)}px`, minHeight: `${canvasHeight}px` }}
      >
        {/* Level 1 — Fields */}
        <div className="flex-shrink-0" style={{ width: COL_WIDTH, marginRight: COL_GAP }}>
          <GraphColumn
            title="Fields of interest"
            hint="Select up to 3"
          >
            {fields.map(field => (
              <motion.div
                key={field.id}
                variants={nodeVariants}
                animate={shakeFieldId === field.id ? { x: [0, -4, 4, -4, 4, 0] } : {}}
                transition={shakeFieldId === field.id ? { duration: 0.4 } : {}}
              >
                <GraphNode
                  id={field.id}
                  label={field.name}
                  isSelected={selectedFieldIds.includes(field.id)}
                  isDisabled={
                    !selectedFieldIds.includes(field.id) && selectedFieldIds.length >= 3
                  }
                  onClick={() => handleFieldClick(field.id)}
                />
              </motion.div>
            ))}
          </GraphColumn>
        </div>

        {/* Level 2 — Pathway */}
        <AnimatePresence>
          {graphLevelVisible >= 2 && (
            <div
              className="flex-shrink-0"
              style={{ width: COL_WIDTH, marginRight: COL_GAP }}
            >
              <GraphColumn title="Pathway" hint="Academic or industry?">
                <PathwayNode
                  label="Academic"
                  description="Supervised research topics from professors"
                  icon={<GraduationCap className="size-4" />}
                  isSelected={selectedPathways.includes('academic')}
                  onClick={() => togglePathway('academic')}
                />
                <PathwayNode
                  label="Industry"
                  description="Company-driven thesis with real-world data"
                  icon={<Building2 className="size-4" />}
                  isSelected={selectedPathways.includes('industry')}
                  onClick={() => togglePathway('industry')}
                />
              </GraphColumn>
            </div>
          )}
        </AnimatePresence>

        {/* Level 3 — Sources */}
        <AnimatePresence>
          {graphLevelVisible >= 3 && sourceNodes.length > 0 && (
            <div
              className="flex-shrink-0"
              style={{ width: COL_WIDTH, marginRight: COL_GAP }}
            >
              <GraphColumn
                title={
                  selectedPathways.includes('academic') && selectedPathways.includes('industry')
                    ? 'Supervisors & Companies'
                    : selectedPathways.includes('academic')
                    ? 'Supervisors'
                    : 'Companies'
                }
                hint="Select up to 3"
              >
                {sourceNodes.map(src => {
                  const isSupervisor = !!supervisorById[src.id]
                  const label = isSupervisor
                    ? `${supervisorById[src.id].title} ${supervisorById[src.id].lastName}`
                    : companyById[src.id]?.name ?? src.id
                  const sublabel = isSupervisor
                    ? supervisorById[src.id].researchInterests.slice(0, 2).join(', ')
                    : companyById[src.id]?.domains.slice(0, 2).join(', ')

                  return (
                    <GraphNode
                      key={src.id}
                      id={src.id}
                      label={label}
                      sublabel={sublabel}
                      icon={
                        isSupervisor ? (
                          <GraduationCap className="size-3 text-muted-foreground" />
                        ) : (
                          <Building2 className="size-3 text-muted-foreground" />
                        )
                      }
                      isSelected={selectedSourceIds.includes(src.id)}
                      isDisabled={
                        !selectedSourceIds.includes(src.id) && selectedSourceIds.length >= 3
                      }
                      onClick={() => toggleSource(src.id)}
                    />
                  )
                })}
              </GraphColumn>
            </div>
          )}
        </AnimatePresence>

        {/* Level 4 — Topics */}
        <AnimatePresence>
          {graphLevelVisible >= 4 && topicNodes.length > 0 && (
            <div className="flex-shrink-0" style={{ width: COL_WIDTH }}>
              <GraphColumn
                title="Thesis topics"
                hint={`${topicNodes.length} found · click to view`}
              >
                {topicNodes.map(topic => {
                  const isBookmarked = bookmarkedTopicIds.includes(topic.id)
                  const isActive = activeTopicId === topic.id
                  const sourceName = topic.companyId
                    ? companyById[topic.companyId]?.name
                    : topic.supervisorIds[0]
                    ? `${supervisorById[topic.supervisorIds[0]]?.title} ${supervisorById[topic.supervisorIds[0]]?.lastName}`
                    : ''
                  const degreeTags = topic.degrees.map(degreeLabel).join(' / ')

                  return (
                    <motion.div
                      key={topic.id}
                      variants={nodeVariants}
                      className="relative"
                    >
                      <motion.div
                        onClick={() => setActiveTopic(isActive ? null : topic.id)}
                        animate={{
                          backgroundColor: isActive ? 'var(--foreground)' : 'var(--card)',
                          borderColor: isActive ? 'var(--foreground)' : 'var(--border)',
                        }}
                        whileHover={{ scale: 1.02, transition: { duration: 0.12 } }}
                        whileTap={{ scale: 0.97, transition: { duration: 0.08 } }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          'relative flex w-[200px] cursor-pointer flex-col justify-center rounded-xl border px-4 py-3 shadow-sm select-none',
                          'min-h-[68px] pr-10'
                        )}
                      >
                        <p
                          className="ds-label leading-tight line-clamp-2"
                          style={{ color: isActive ? 'var(--background)' : 'var(--foreground)' }}
                        >
                          {topic.title}
                        </p>
                        <p
                          className="ds-caption mt-0.5 leading-tight truncate"
                          style={{
                            color: isActive ? 'oklch(0.7 0 0)' : 'var(--muted-foreground)',
                          }}
                        >
                          {sourceName} · {degreeTags}
                        </p>
                      </motion.div>

                      {/* Bookmark button */}
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={e => {
                          e.stopPropagation()
                          toggleBookmark(topic.id)
                        }}
                        className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark topic'}
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="size-3.5 text-foreground" />
                        ) : (
                          <Bookmark className="size-3.5" />
                        )}
                      </motion.button>
                    </motion.div>
                  )
                })}

                {topicsForSourcesAndFields(selectedSourceIds, selectedFieldIds, selectedPathways).length > 15 && (
                  <p className="ds-caption text-muted-foreground px-2">
                    +{topicsForSourcesAndFields(selectedSourceIds, selectedFieldIds, selectedPathways).length - 15} more — refine your selection
                  </p>
                )}
              </GraphColumn>
            </div>
          )}
        </AnimatePresence>

        {/* Empty state for Level 3 — no results */}
        <AnimatePresence>
          {graphLevelVisible >= 3 && sourceNodes.length === 0 && (
            <motion.div
              key="empty-sources"
              initial={columnInitial}
              animate={columnAnimate}
              exit={columnExit}
              transition={columnTransition}
              className="flex-shrink-0 flex flex-col items-center justify-center text-center"
              style={{ width: COL_WIDTH, marginRight: COL_GAP, minHeight: 200 }}
            >
              <p className="ds-label text-muted-foreground">No sources found</p>
              <p className="ds-caption text-muted-foreground/60 mt-1">
                Try selecting different fields
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend / instructions */}
      <div className="absolute bottom-4 left-12 right-4 flex items-center gap-4 pointer-events-none">
        {selectedFieldIds.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ds-caption text-muted-foreground/70"
          >
            ← Start by selecting your fields of interest
          </motion.p>
        )}
        {selectedFieldIds.length > 0 && selectedPathways.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ds-caption text-muted-foreground/70"
          >
            Now choose your pathway →
          </motion.p>
        )}
        {selectedPathways.length > 0 && selectedSourceIds.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ds-caption text-muted-foreground/70"
          >
            Select supervisors or companies to explore their topics →
          </motion.p>
        )}
        {selectedSourceIds.length > 0 && topicNodes.length === 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="ds-caption text-muted-foreground/70"
          >
            No topics matched — try different fields or sources
          </motion.p>
        )}
      </div>
    </div>
  )
}
