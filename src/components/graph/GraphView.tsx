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
} from '@xyflow/react'

import { useAppStore, deriveGraphLevel } from '@/store/useAppStore'
import {
  fields,
  supervisorsForFields,
  companiesForFields,
  topicsForSourcesAndFields,
  companyById,
  supervisorById,
  degreeLabel,
} from '@/data/index'

import { CenterNode } from './nodes/CenterNode'
import { FieldNode } from './nodes/FieldNode'
import { PathwayNode } from './nodes/PathwayNode'
import { SourceNode } from './nodes/SourceNode'
import { TopicNode } from './nodes/TopicNode'
import { FloatingEdge } from './edges/FloatingEdge'

const nodeTypes = {
  center: CenterNode,
  field: FieldNode,
  pathway: PathwayNode,
  source: SourceNode,
  topic: TopicNode,
}

const edgeTypes = {
  floating: FloatingEdge,
}

// ─── Layout constants ────────────────────────────────────────────────────────
const R1 = 320  // fields ring radius
const R2 = 540  // pathway ring radius
const R3 = 780  // sources ring radius
const R4 = 1040 // topics ring radius

function toRad(deg: number) { return deg * (Math.PI / 180) }

function ringPosition(radius: number, angleDeg: number) {
  return {
    x: Math.round(radius * Math.cos(toRad(angleDeg))),
    y: Math.round(radius * Math.sin(toRad(angleDeg))),
  }
}

function spreadAngles(count: number, centerDeg: number, spreadDeg: number): number[] {
  if (count === 1) return [centerDeg]
  return Array.from({ length: count }, (_, i) =>
    centerDeg - spreadDeg / 2 + (i / (count - 1)) * spreadDeg
  )
}

// ─── Node/edge builders ───────────────────────────────────────────────────────

interface GraphState {
  selectedFieldIds: string[]
  selectedPathways: string[]
  selectedSourceIds: string[]
  graphLevel: number
}

function buildGraphElements(state: GraphState): { nodes: Node[]; edges: Edge[] } {
  const { selectedFieldIds, selectedPathways, selectedSourceIds, graphLevel } = state
  const nodes: Node[] = []
  const edges: Edge[] = []

  const atFieldMax = selectedFieldIds.length >= 3
  const atSourceMax = selectedSourceIds.length >= 3

  // ── Center node ─────────────────────────────────────────────────────────────
  nodes.push({
    id: 'center',
    type: 'center',
    position: { x: -80, y: -30 }, // center offset for node size
    data: {},
    draggable: true,
  })

  // ── Ring 1: Fields ──────────────────────────────────────────────────────────
  const fieldCount = fields.length // 20
  fields.forEach((field, i) => {
    const angleDeg = i * (360 / fieldCount) - 90 // start from top
    const pos = ringPosition(R1, angleDeg)

    nodes.push({
      id: `field-${field.id}`,
      type: 'field',
      position: { x: pos.x - 65, y: pos.y - 18 }, // center the ~130px node
      data: {
        fieldId: field.id,
        label: field.name,
        atMax: atFieldMax,
      },
      draggable: true,
    })

    // Edge: field → center (always present, opacity driven by selected state in edge data)
    const isFieldSelected = selectedFieldIds.includes(field.id)
    edges.push({
      id: `e-field-center-${field.id}`,
      source: `field-${field.id}`,
      target: 'center',
      type: 'floating',
      data: { selected: isFieldSelected, dimmed: !isFieldSelected },
    } as Edge)
  })

  if (graphLevel < 2) return { nodes, edges }

  // ── Ring 2: Pathways ────────────────────────────────────────────────────────
  const pathwayDefs = [
    { pathway: 'academic', label: 'Academic', description: 'Supervised research', angleDeg: -150 },
    { pathway: 'industry', label: 'Industry', description: 'Company-driven thesis', angleDeg: -30 },
  ]

  pathwayDefs.forEach(({ pathway, label, description, angleDeg }) => {
    const pos = ringPosition(R2, angleDeg)
    nodes.push({
      id: `pathway-${pathway}`,
      type: 'pathway',
      position: { x: pos.x - 85, y: pos.y - 55 }, // center ~170×110px node
      data: { pathway, label, description },
      draggable: true,
    })

    // Edge from each selected field → pathway node
    selectedFieldIds.forEach(fid => {
      edges.push({
        id: `e-field-pathway-${fid}-${pathway}`,
        source: `field-${fid}`,
        target: `pathway-${pathway}`,
        type: 'floating',
        data: { selected: selectedPathways.includes(pathway), dimmed: !selectedPathways.includes(pathway) },
      } as Edge)
    })
  })

  if (graphLevel < 3) return { nodes, edges }

  // ── Ring 3: Sources ─────────────────────────────────────────────────────────
  const sourceNodes =
    selectedPathways.includes('academic') && selectedPathways.includes('industry')
      ? [
          ...supervisorsForFields(selectedFieldIds).slice(0, 7),
          ...companiesForFields(selectedFieldIds).slice(0, 6),
        ]
      : selectedPathways.includes('academic')
      ? supervisorsForFields(selectedFieldIds).slice(0, 10)
      : selectedPathways.includes('industry')
      ? companiesForFields(selectedFieldIds).slice(0, 10)
      : []

  const sourceAngles = spreadAngles(
    Math.max(sourceNodes.length, 1),
    -90,
    Math.min(sourceNodes.length * 22, 280)
  )

  sourceNodes.forEach((src, i) => {
    const isSupervisor = !!supervisorById[src.id]
    const label = isSupervisor
      ? `${supervisorById[src.id].title} ${supervisorById[src.id].lastName}`
      : companyById[src.id]?.name ?? src.id
    const sublabel = isSupervisor
      ? supervisorById[src.id].researchInterests.slice(0, 2).join(', ')
      : companyById[src.id]?.domains.slice(0, 2).join(', ')

    const pos = ringPosition(R3, sourceAngles[i])
    nodes.push({
      id: `source-${src.id}`,
      type: 'source',
      position: { x: pos.x - 80, y: pos.y - 28 }, // center ~160×56px node
      data: {
        sourceId: src.id,
        label,
        sublabel,
        isAcademic: isSupervisor,
        atMax: atSourceMax,
      },
      draggable: true,
    })

    // Edge: relevant pathway → source
    const pathway = isSupervisor ? 'academic' : 'industry'
    if (selectedPathways.includes(pathway)) {
      edges.push({
        id: `e-pathway-source-${pathway}-${src.id}`,
        source: `pathway-${pathway}`,
        target: `source-${src.id}`,
        type: 'floating',
        data: { selected: selectedSourceIds.includes(src.id), dimmed: !selectedSourceIds.includes(src.id) },
      } as Edge)
    }
  })

  if (graphLevel < 4) return { nodes, edges }

  // ── Ring 4: Topics ───────────────────────────────────────────────────────────
  const topicList = topicsForSourcesAndFields(
    selectedSourceIds,
    selectedFieldIds,
    selectedPathways as ('academic' | 'industry')[]
  ).slice(0, 15)

  const topicAngles = spreadAngles(
    Math.max(topicList.length, 1),
    -90,
    Math.min(topicList.length * 18, 300)
  )

  topicList.forEach((topic, i) => {
    const sourceName = topic.companyId
      ? companyById[topic.companyId]?.name ?? ''
      : topic.supervisorIds[0]
      ? `${supervisorById[topic.supervisorIds[0]]?.title} ${supervisorById[topic.supervisorIds[0]]?.lastName}`
      : ''
    const degreeTags = topic.degrees.map(degreeLabel).join(' / ')

    const pos = ringPosition(R4, topicAngles[i])
    nodes.push({
      id: `topic-${topic.id}`,
      type: 'topic',
      position: { x: pos.x - 85, y: pos.y - 35 }, // center ~170×70px node
      data: {
        topicId: topic.id,
        label: topic.title,
        sourceName,
        degreeTags,
      },
      draggable: true,
    })

    // Edges: selected source → topics it owns
    for (const sid of selectedSourceIds) {
      if (topic.supervisorIds.includes(sid) || topic.companyId === sid) {
        edges.push({
          id: `e-source-topic-${sid}-${topic.id}`,
          source: `source-${sid}`,
          target: `topic-${topic.id}`,
          type: 'floating',
          data: { selected: true, dimmed: false },
        } as Edge)
      }
    }
  })

  return { nodes, edges }
}

// ─── Inner component (needs ReactFlow context) ────────────────────────────────

function GraphCanvas() {
  const store = useAppStore()
  const { fitView } = useReactFlow()

  const graphLevel = deriveGraphLevel(store)
  const prevLevel = useRef(graphLevel)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Rebuild graph whenever relevant state changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildGraphElements({
      selectedFieldIds: store.selectedFieldIds,
      selectedPathways: store.selectedPathways,
      selectedSourceIds: store.selectedSourceIds,
      graphLevel,
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
    store.selectedPathways,
    store.selectedSourceIds,
    graphLevel,
    setNodes,
    setEdges,
    fitView,
  ])

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    // Node clicks are handled inside each custom node component via the store
    // No additional logic needed here — keeps nodes self-contained
    void node
  }, [])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
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

      {/* Graph instruction hints */}
      <div className="pointer-events-none absolute bottom-4 left-4 right-4 flex justify-center">
        {graphLevel === 1 && (
          <p className="ds-caption rounded-lg bg-background/80 px-3 py-1.5 text-muted-foreground backdrop-blur-sm border border-border">
            Select up to 3 fields of interest to begin
          </p>
        )}
        {graphLevel === 2 && (
          <p className="ds-caption rounded-lg bg-background/80 px-3 py-1.5 text-muted-foreground backdrop-blur-sm border border-border">
            Choose Academic, Industry, or both
          </p>
        )}
        {graphLevel === 3 && (
          <p className="ds-caption rounded-lg bg-background/80 px-3 py-1.5 text-muted-foreground backdrop-blur-sm border border-border">
            Select up to 3 supervisors or companies
          </p>
        )}
        {graphLevel === 4 && (
          <p className="ds-caption rounded-lg bg-background/80 px-3 py-1.5 text-muted-foreground backdrop-blur-sm border border-border">
            Click a topic to view details · bookmark to save
          </p>
        )}
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
