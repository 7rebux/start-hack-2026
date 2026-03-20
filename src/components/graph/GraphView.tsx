import { useEffect, useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type NodeChange,
} from '@xyflow/react'

import { useAppStore, deriveGraphLevel } from '@/store/useAppStore'
import { ACADEMIC, INDUSTRY } from './colors'

import {
  fields,
  topics,
  universitiesForFields,
  companiesForFields,
  topicsForSourcesAndFields,
  companyById,
  supervisorById,
  universityById,
  degreeLabel,
} from '@/data/index'

import { GraduationCap, Building2 } from 'lucide-react'
import { CenterNode } from './nodes/CenterNode'
import { FieldNode } from './nodes/FieldNode'
import { SourceNode } from './nodes/SourceNode'
import { TopicNode } from './nodes/TopicNode'
import { FloatingEdge } from './edges/FloatingEdge'

const nodeTypes = {
  center: CenterNode,
  field: FieldNode,
  source: SourceNode,
  topic: TopicNode,
}

const edgeTypes = {
  floating: FloatingEdge,
}

// ─── Layout constants ────────────────────────────────────────────────────────
const R1 = 330   // fields ring radius
const R2 = 550   // sources ring radius (universities + companies)
const R3 = 750   // topics ring radius

const FIELD_START_DEG  = -90  // fields fan starts from top
const TOPIC_FAN_PER_SOURCE = 7   // degrees per topic in a source's fan
const TOPIC_MAX_PER_SOURCE = 64  // max fan spread per source (degrees)

function toRad(deg: number) { return deg * (Math.PI / 180) }

function ringPosition(radius: number, angleDeg: number) {
  return {
    x: Math.round(radius * Math.cos(toRad(angleDeg))),
    y: Math.round(radius * Math.sin(toRad(angleDeg))),
  }
}

function spreadAngles(count: number, centerDeg: number, maxSpreadDeg: number): number[] {
  if (count === 1) return [centerDeg]
  const spread = Math.min(count * 22, maxSpreadDeg)
  return Array.from({ length: count }, (_, i) =>
    centerDeg - spread / 2 + (i / (count - 1)) * spread
  )
}

// ─── Node/edge builders ───────────────────────────────────────────────────────

interface GraphState {
  selectedFieldIds: string[]
  selectedSourceIds: string[]
  suggestedFieldIds: string[]
  graphLevel: number
  savedPositions: Map<string, { x: number; y: number }>
}

function buildGraphElements(state: GraphState): { nodes: Node[]; edges: Edge[] } {
  const { selectedFieldIds, selectedSourceIds, suggestedFieldIds, graphLevel, savedPositions } = state
  const nodes: Node[] = []
  const edges: Edge[] = []

  const atFieldMax = selectedFieldIds.length >= 3
  const hasSuggestions = suggestedFieldIds.length > 0

  function pos(id: string, defaultPos: { x: number; y: number }) {
    return savedPositions.get(id) ?? defaultPos
  }

  // ── Center node ─────────────────────────────────────────────────────────────
  nodes.push({
    id: 'center',
    type: 'center',
    position: pos('center', { x: -80, y: -30 }),
    data: {},
    draggable: true,
  })

  // ── Ring 1: Fields ──────────────────────────────────────────────────────────
  const fieldCount = fields.length
  fields.forEach((field, i) => {
    const angleDeg = FIELD_START_DEG + i * (360 / fieldCount)
    const defaultPos = ringPosition(R1, angleDeg)
    const isFieldSelected = selectedFieldIds.includes(field.id)
    const isSuggested = suggestedFieldIds.includes(field.id)
    const nodeId = `field-${field.id}`

    nodes.push({
      id: nodeId,
      type: 'field',
      position: pos(nodeId, { x: defaultPos.x - 65, y: defaultPos.y - 18 }),
      data: {
        fieldId: field.id,
        label: field.name,
        atMax: atFieldMax,
        suggested: isSuggested,
        hasSuggestions,
      },
      draggable: true,
    })

    edges.push({
      id: `e-field-center-${field.id}`,
      source: `field-${field.id}`,
      target: 'center',
      type: 'floating',
      data: { selected: isFieldSelected, dimmed: !isFieldSelected },
    } as Edge)
  })

  if (graphLevel < 2) return { nodes, edges }

  // ── Ring 2: Sources — universities LEFT (180°), companies RIGHT (0°) ──────────
  const academicSources = universitiesForFields(selectedFieldIds).slice(0, 12)
  const industrySources = companiesForFields(selectedFieldIds).slice(0, 12)
  const academicAngles = spreadAngles(academicSources.length, 180, 150)
  const industryAngles = spreadAngles(industrySources.length, 0, 150)

  const allSources: Array<{ id: string; angle: number; isAcademic: boolean }> = [
    ...academicSources.map((s, i) => ({ id: s.id, angle: academicAngles[i], isAcademic: true })),
    ...industrySources.map((s, i) => ({ id: s.id, angle: industryAngles[i], isAcademic: false })),
  ]

  allSources.forEach(({ id: srcId, angle, isAcademic }) => {
    const uni = isAcademic ? universityById[srcId] : null
    const co = isAcademic ? null : companyById[srcId]
    const label = uni?.name ?? co?.name ?? srcId
    const sublabel = uni?.domains.slice(0, 2).join(', ') ?? co?.domains.slice(0, 2).join(', ') ?? ''
    const defaultPos = ringPosition(R2, angle)
    const nodeId = `source-${srcId}`

    nodes.push({
      id: nodeId,
      type: 'source',
      position: pos(nodeId, { x: defaultPos.x - 80, y: defaultPos.y - 28 }),
      data: { sourceId: srcId, label, sublabel, isAcademic, atMax: false },
      draggable: true,
    })

    // Edge: source → relevant field nodes (not center)
    const relevantFields = selectedFieldIds.filter(fieldId =>
      topics.some(t =>
        t.fieldIds.includes(fieldId) &&
        (isAcademic ? t.universityId === srcId : t.companyId === srcId)
      )
    )

    if (relevantFields.length > 0) {
      relevantFields.forEach(fieldId => {
        edges.push({
          id: `e-field-source-${fieldId}-${srcId}`,
          source: `field-${fieldId}`,
          target: nodeId,
          type: 'floating',
          data: {
            selected: selectedSourceIds.includes(srcId),
            dimmed: !selectedSourceIds.includes(srcId),
            isAcademic,
          },
        } as Edge)
      })
    } else {
      // Fallback: connect to center if no field matches found
      edges.push({
        id: `e-center-source-${srcId}`,
        source: 'center',
        target: nodeId,
        type: 'floating',
        data: {
          selected: selectedSourceIds.includes(srcId),
          dimmed: !selectedSourceIds.includes(srcId),
          isAcademic,
        },
      } as Edge)
    }
  })

  if (graphLevel < 3) return { nodes, edges }

  // ── Ring 3: Topics — clustered near each selected source node ─────────────────
  const allTopics = topicsForSourcesAndFields(
    selectedSourceIds,
    selectedFieldIds,
    ['academic', 'industry']
  )

  allSources.forEach((src) => {
    if (!selectedSourceIds.includes(src.id)) return
    const srcAngle = src.angle
    const isAcademic = src.isAcademic
    const srcTopics = allTopics
      .filter(t => isAcademic ? t.universityId === src.id : t.companyId === src.id)
      .slice(0, 8)
    if (srcTopics.length === 0) return

    const fanSpread = Math.min(srcTopics.length * TOPIC_FAN_PER_SOURCE, TOPIC_MAX_PER_SOURCE)
    const tAngles = spreadAngles(srcTopics.length, srcAngle, fanSpread)

    srcTopics.forEach((topic, j) => {
      const isTopicAcademic = !topic.companyId
      const sourceName = topic.companyId
        ? companyById[topic.companyId]?.name ?? ''
        : topic.supervisorIds[0]
          ? `${supervisorById[topic.supervisorIds[0]]?.title ?? ''} ${supervisorById[topic.supervisorIds[0]]?.lastName ?? ''}`.trim()
          : (topic.universityId ? universityById[topic.universityId]?.name ?? '' : '')
      const degreeTags = topic.degrees.map(degreeLabel).join(' / ')
      const defaultPos = ringPosition(R3, tAngles[j])
      const nodeId = `topic-${topic.id}`

      nodes.push({
        id: nodeId,
        type: 'topic',
        position: pos(nodeId, { x: defaultPos.x - 85, y: defaultPos.y - 35 }),
        data: { topicId: topic.id, label: topic.title, sourceName, degreeTags, isAcademic: isTopicAcademic },
        draggable: true,
      })
      edges.push({
        id: `e-source-topic-${src.id}-${topic.id}`,
        source: `source-${src.id}`,
        target: nodeId,
        type: 'floating',
        data: { selected: true, dimmed: false, isAcademic: isTopicAcademic },
      } as Edge)
    })
  })

  return { nodes, edges }
}

// ─── Inner component (needs ReactFlow context) ────────────────────────────────

function GraphCanvas() {
  const store = useAppStore()
  const { fitView } = useReactFlow()

  const graphLevel = deriveGraphLevel(store)
  const prevLevel = useRef(graphLevel)

  // Persist dragged positions across rebuilds
  const nodePositions = useRef<Map<string, { x: number; y: number }>>(new Map())

  const [nodes, setNodes, onNodesChangeRaw] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Wrap onNodesChange to track position updates
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    for (const change of changes) {
      if (change.type === 'position' && change.position) {
        nodePositions.current.set(change.id, change.position)
      }
    }
    onNodesChangeRaw(changes)
  }, [onNodesChangeRaw])

  // Rebuild graph whenever relevant state changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildGraphElements({
      selectedFieldIds: store.selectedFieldIds,
      selectedSourceIds: store.selectedSourceIds,
      suggestedFieldIds: store.suggestedFieldIds,
      graphLevel,
      savedPositions: nodePositions.current,
    })
    setNodes(newNodes)
    setEdges(newEdges)

    // Fit view when level increases (new ring appears)
    if (graphLevel > prevLevel.current) {
      setTimeout(() => fitView({ padding: 0.18, duration: 700 }), 80)
    }
    prevLevel.current = graphLevel
  }, [
    store.selectedFieldIds,
    store.selectedSourceIds,
    store.suggestedFieldIds,
    graphLevel,
    setNodes,
    setEdges,
    fitView,
  ])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (node.id.startsWith('topic-')) {
      const topicId = node.id.replace('topic-', '')
      store.setActiveTopic(store.activeTopicId === topicId ? null : topicId)
    }
  }, [store])

  const onNodeDoubleClick = useCallback<NodeMouseHandler>((_e, node) => {
    if (node.id.startsWith('source-')) {
      const sourceId = node.id.replace('source-', '')
      store.setActiveSource(sourceId)
    }
  }, [store])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.15}
        maxZoom={2}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />
      </ReactFlow>

      {/* Bottom bar: legend + hint */}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex items-center justify-between gap-4">

        {/* Color legend — visible once sources appear */}
        <div className={`flex items-center gap-4 rounded-lg bg-background/80 backdrop-blur-sm border border-border px-4 py-2 transition-opacity duration-300 ${graphLevel >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-1.5">
            <div className="flex size-5 items-center justify-center rounded-md" style={{ backgroundColor: ACADEMIC.bg, border: `1px solid ${ACADEMIC.border}` }}>
              <GraduationCap className="size-3" style={{ color: ACADEMIC.text }} />
            </div>
            <span className="ds-caption text-muted-foreground">Universities</span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <div className="flex size-5 items-center justify-center rounded-md" style={{ backgroundColor: INDUSTRY.bg, border: `1px solid ${INDUSTRY.border}` }}>
              <Building2 className="size-3" style={{ color: INDUSTRY.text }} />
            </div>
            <span className="ds-caption text-muted-foreground">Companies</span>
          </div>
        </div>

        {/* Contextual hint */}
        <p className="ds-caption rounded-lg bg-background/80 px-3 py-2 text-muted-foreground backdrop-blur-sm border border-border">
          {graphLevel === 1 && 'Select up to 3 fields of interest to begin'}
          {graphLevel === 2 && 'Click to select a source · double-click for details'}
          {graphLevel === 3 && 'Click a topic to preview · double-click a source for full profile'}
        </p>

      </div>
    </div>
  )
}

// ─── Public export (wraps in provider) ───────────────────────────────────────

export function GraphView() {
  return (
    <ReactFlowProvider>
      <GraphCanvas />
    </ReactFlowProvider>
  )
}
