import { useEffect, useCallback, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Panel,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  type Node,
  type Edge,
} from '@xyflow/react'

import { useAppStore } from '@/store/useAppStore'
import type { TopicGroup } from '@/store/useAppStore'

import {
  topicById,
  fieldById,
  supervisorById,
  expertById,
  universityById,
  companyById,
} from '@/data/index'

import projectsRaw from '../../../mock-data/projects.json'
import studentsRaw from '../../../mock-data/students.json'
import type { Project, Student } from '@/types/entities'

import { applyElkLayout } from './layouts/elkLayout'
import { FieldSelectDialog } from './FieldSelectDialog'

// Overview nodes
import { UniversityProgramNode } from './nodes/UniversityProgramNode'
import { NewNode } from './nodes/NewNode'
import { FieldEntryNode } from './nodes/FieldEntryNode'
import { TopicGroupNode } from './nodes/TopicGroupNode'

// Detail nodes
import { TopicDetailNode } from './nodes/detail/TopicDetailNode'
import { ExpertDetailNode } from './nodes/detail/ExpertDetailNode'
import { SupervisorDetailNode } from './nodes/detail/SupervisorDetailNode'
import { UniversityDetailNode } from './nodes/detail/UniversityDetailNode'
import { CompanyDetailNode } from './nodes/detail/CompanyDetailNode'
import { ProjectDetailNode } from './nodes/detail/ProjectDetailNode'
import { StudentDetailNode } from './nodes/detail/StudentDetailNode'

import { FloatingEdge } from './edges/FloatingEdge'

const projectsData = projectsRaw as Project[]
const studentsData = studentsRaw as Student[]

const nodeTypes = {
  universityProgram: UniversityProgramNode,
  newNode: NewNode,
  fieldEntry: FieldEntryNode,
  topicGroup: TopicGroupNode,
  topicDetail: TopicDetailNode,
  expertDetail: ExpertDetailNode,
  supervisorDetail: SupervisorDetailNode,
  universityDetail: UniversityDetailNode,
  companyDetail: CompanyDetailNode,
  projectDetail: ProjectDetailNode,
  studentDetail: StudentDetailNode,
}

const edgeTypes = {
  floating: FloatingEdge,
}

// ─── Visibility computation ───────────────────────────────────────────────────

export function computeVisibleNodeIds(edges: Edge[], selectedNodeId: string): Set<string> {
  const parentListMap = new Map<string, string[]>()  // target → [sources]
  const childMap = new Map<string, string[]>()        // source → [targets]

  for (const edge of edges) {
    if (!parentListMap.has(edge.target)) parentListMap.set(edge.target, [])
    parentListMap.get(edge.target)!.push(edge.source)

    if (!childMap.has(edge.source)) childMap.set(edge.source, [])
    childMap.get(edge.source)!.push(edge.target)
  }

  const visible = new Set<string>()
  visible.add(selectedNodeId)

  // BFS upward to collect all ancestors
  const queue = [selectedNodeId]
  const visitedUp = new Set<string>()
  while (queue.length > 0) {
    const nodeId = queue.shift()!
    if (visitedUp.has(nodeId)) continue
    visitedUp.add(nodeId)
    for (const parent of (parentListMap.get(nodeId) ?? [])) {
      visible.add(parent)
      queue.push(parent)
    }
  }

  // Add direct children
  for (const child of (childMap.get(selectedNodeId) ?? [])) {
    visible.add(child)
  }

  return visible
}

// ─── Overview graph builder ───────────────────────────────────────────────────

import type { FieldEntry } from '@/store/useAppStore'

interface OverviewState {
  selectedUniversityId: string | null
  selectedProgramId: string | null
  fieldEntries: FieldEntry[]
  onOpenDialog: () => void
}

function buildOverviewElements(state: OverviewState): { nodes: Node[]; edges: Edge[] } {
  const { selectedUniversityId, selectedProgramId, fieldEntries, onOpenDialog } = state
  const nodes: Node[] = []
  const edges: Edge[] = []

  nodes.push({
    id: 'uni-program',
    type: 'universityProgram',
    position: { x: 0, y: 0 },
    data: {},
  })

  if (!selectedUniversityId || !selectedProgramId) {
    return { nodes, edges }
  }

  nodes.push({
    id: 'new-node',
    type: 'newNode',
    position: { x: 0, y: 0 },
    data: { onOpen: onOpenDialog },
  })
  edges.push({
    id: 'e-uni-new',
    source: 'uni-program',
    target: 'new-node',
    type: 'default',
    style: { stroke: 'var(--border)', strokeWidth: 2 },
  })

  fieldEntries.forEach(entry => {
    const fieldNodeId = `field-entry-${entry.fieldId}`
    nodes.push({
      id: fieldNodeId,
      type: 'fieldEntry',
      position: { x: 0, y: 0 },
      data: entry as unknown as Record<string, unknown>,
    })
    edges.push({
      id: `e-uni-field-${entry.fieldId}`,
      source: 'uni-program',
      target: fieldNodeId,
      type: 'default',
      style: { stroke: 'var(--border)', strokeWidth: 1.5 },
    })

    entry.groups.forEach(group => {
      nodes.push({
        id: `group-${group.id}`,
        type: 'topicGroup',
        position: { x: 0, y: 0 },
        data: group as unknown as Record<string, unknown>,
      })
      edges.push({
        id: `e-field-group-${group.id}`,
        source: fieldNodeId,
        target: `group-${group.id}`,
        type: 'default',
        style: { stroke: 'var(--border)', strokeWidth: 1.5 },
      })
    })
  })

  return { nodes, edges }
}

// ─── Detail graph builder ─────────────────────────────────────────────────────

function resolveFieldNames(fieldIds: string[]): string[] {
  return fieldIds.map(fid => fieldById[fid]?.name ?? fid)
}

function buildGroupGraph(group: TopicGroup): { nodes: Node[]; edges: Edge[] } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes: any[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edges: any[] = []
  const nodeIds = new Set<string>()

  // Add topic nodes
  for (const topicId of group.topicIds) {
    const topic = topicById[topicId]
    if (!topic) continue
    nodeIds.add(topicId)
    nodes.push({
      id: topicId,
      type: 'topicDetail',
      position: { x: 0, y: 0 },
      data: { ...topic, fieldNames: resolveFieldNames(topic.fieldIds) },
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function addChild(parentId: string, childId: string, buildNode: () => any) {
    if (!nodeIds.has(childId)) {
      nodeIds.add(childId)
      nodes.push(buildNode())
    }
    const edgeId = `${parentId}-${childId}`
    if (!edges.some((e: Edge) => e.id === edgeId)) {
      edges.push({ id: edgeId, source: parentId, target: childId })
    }
  }

  // Add all children for each topic unconditionally
  for (const topicId of group.topicIds) {
    const topic = topicById[topicId]
    if (!topic) continue

    if (topic.companyId) {
      const company = companyById[topic.companyId]
      if (company) {
        addChild(topicId, company.id, () => ({
          id: company.id, type: 'companyDetail', position: { x: 0, y: 0 }, data: company,
        }))
      }
    }

    if (topic.universityId) {
      const university = universityById[topic.universityId]
      if (university) {
        addChild(topicId, university.id, () => ({
          id: university.id, type: 'universityDetail', position: { x: 0, y: 0 }, data: university,
        }))
      }
    }

    for (const supId of topic.supervisorIds) {
      const sup = supervisorById[supId]
      if (sup) {
        addChild(topicId, sup.id, () => ({
          id: sup.id, type: 'supervisorDetail', position: { x: 0, y: 0 },
          data: { ...sup, fieldNames: resolveFieldNames(sup.fieldIds) },
        }))
      }
    }

    for (const expId of topic.expertIds) {
      const exp = expertById[expId]
      if (exp) {
        addChild(topicId, exp.id, () => ({
          id: exp.id, type: 'expertDetail', position: { x: 0, y: 0 },
          data: { ...exp, fieldNames: resolveFieldNames(exp.fieldIds) },
        }))
      }
    }

    // Projects and all their sub-children
    const projects = projectsData.filter(p => p.topicId === topicId)
    for (const project of projects) {
      addChild(topicId, project.id, () => ({
        id: project.id, type: 'projectDetail', position: { x: 0, y: 0 },
        data: { ...project },
      }))

      if (project.companyId) {
        const company = companyById[project.companyId]
        if (company) addChild(project.id, company.id, () => ({ id: company.id, type: 'companyDetail', position: { x: 0, y: 0 }, data: company }))
      }

      if (project.universityId) {
        const university = universityById[project.universityId]
        if (university) addChild(project.id, university.id, () => ({ id: university.id, type: 'universityDetail', position: { x: 0, y: 0 }, data: university }))
      }

      for (const supId of project.supervisorIds) {
        const sup = supervisorById[supId]
        if (sup) addChild(project.id, sup.id, () => ({ id: sup.id, type: 'supervisorDetail', position: { x: 0, y: 0 }, data: { ...sup, fieldNames: resolveFieldNames(sup.fieldIds) } }))
      }

      for (const expId of project.expertIds) {
        const exp = expertById[expId]
        if (exp) addChild(project.id, exp.id, () => ({ id: exp.id, type: 'expertDetail', position: { x: 0, y: 0 }, data: { ...exp, fieldNames: resolveFieldNames(exp.fieldIds) } }))
      }

      if (project.studentId) {
        const student = studentsData.find(s => s.id === project.studentId)
        if (student) addChild(project.id, student.id, () => ({ id: student.id, type: 'studentDetail', position: { x: 0, y: 0 }, data: student }))
      }
    }
  }

  return { nodes, edges }
}

// ─── Inner component ──────────────────────────────────────────────────────────

function GraphCanvas() {
  const store = useAppStore()
  const { fitView } = useReactFlow()

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])
  const [dialogOpen, setDialogOpen] = useState(false)

  const structureEdgesRef = useRef<Edge[]>([])
  const selectedNodeIdRef = useRef<string>(store.selectedNodeId)
  // Keep ref in sync every render so Effect 1's async callback reads the latest value
  selectedNodeIdRef.current = store.selectedNodeId

  const handleNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    store.setSelectedNode(node.id)
  }, [store])

  // Effect 1: Structure — runs ELK, stores edges, applies initial visibility
  useEffect(() => {
    const overview = buildOverviewElements({
      selectedUniversityId: store.selectedUniversityId,
      selectedProgramId: store.selectedProgramId,
      fieldEntries: store.fieldEntries,
      onOpenDialog: () => setDialogOpen(true),
    })

    const allGroupsFlat = store.fieldEntries.flatMap(e => e.groups)
    const activeGroups = store.activeGroupIds
      .map(id => allGroupsFlat.find(g => g.id === id))
      .filter((g): g is TopicGroup => g !== undefined)

    let allNodes = overview.nodes
    let allEdges = overview.edges

    const seenNodeIds = new Set(overview.nodes.map(n => n.id))

    for (const group of activeGroups) {
      const { nodes: detailNodes, edges: detailEdges } = buildGroupGraph(group)

      const connectingEdges: Edge[] = group.topicIds.map(topicId => ({
        id: `e-grp-topic-${group.id}-${topicId}`,
        source: `group-${group.id}`,
        target: topicId,
        type: 'default',
        style: { stroke: 'var(--border)', strokeWidth: 1.5, strokeDasharray: '5,4' },
      }))

      const newNodes = detailNodes.filter(n => !seenNodeIds.has(n.id))
      newNodes.forEach(n => seenNodeIds.add(n.id))

      allNodes = [...allNodes, ...newNodes]
      allEdges = [...allEdges, ...detailEdges, ...connectingEdges]
    }

    applyElkLayout(allNodes, allEdges).then(layouted => {
      structureEdgesRef.current = allEdges
      const visible = computeVisibleNodeIds(allEdges, selectedNodeIdRef.current)
      const visibleNodes = (layouted as Node[]).map(n => ({ ...n, hidden: !visible.has(n.id) }))
      const visibleEdges = allEdges.map(e => ({
        ...e,
        hidden: !(visible.has(e.source) && visible.has(e.target)),
      }))
      setNodes(visibleNodes)
      setEdges(visibleEdges)
      setTimeout(() => fitView({ padding: 0.18, duration: 500 }), 60)
    })
  }, [
    store.activeGroupIds,
    store.selectedUniversityId,
    store.selectedProgramId,
    store.fieldEntries,
    setNodes,
    setEdges,
    fitView,
  ])

  // Effect 2: Visibility — runs on selection change only, no re-layout
  useEffect(() => {
    const visible = computeVisibleNodeIds(structureEdgesRef.current, store.selectedNodeId)
    setNodes(ns => ns.map(n => ({ ...n, hidden: !visible.has(n.id) })))
    setEdges(es => es.map(e => ({
      ...e,
      hidden: !(visible.has(e.source) && visible.has(e.target)),
    })))
  }, [store.selectedNodeId, setNodes, setEdges])

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        proOptions={{ hideAttribution: true }}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.1}
        maxZoom={2}
        nodesConnectable={false}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--border)" />

        <Panel position="bottom-right">
          <p className="ds-caption rounded-lg bg-background/80 px-3 py-2 text-muted-foreground backdrop-blur-sm border border-border">
            {!store.selectedUniversityId
              ? 'Select your university and program to begin'
              : !store.selectedProgramId
              ? 'Select your program'
              : store.fieldEntries.length === 0
              ? 'Click + to add a field and explore topic clusters'
              : store.activeGroupIds.length > 0
              ? 'Click a node to explore · drag to rearrange'
              : 'Click + to add another field · click a cluster to expand it'}
          </p>
        </Panel>
      </ReactFlow>

      <FieldSelectDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

// ─── Public export ────────────────────────────────────────────────────────────

export function GraphView() {
  return (
    <ReactFlowProvider>
      <GraphCanvas />
    </ReactFlowProvider>
  )
}
