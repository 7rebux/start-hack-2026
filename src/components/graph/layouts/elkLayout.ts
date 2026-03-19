import ELK from 'elkjs/lib/elk.bundled.js'
import type { Node, Edge } from '@xyflow/react'

export const NODE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  // Overview nodes
  universityProgram: { width: 290, height: 130 },
  newNode: { width: 64, height: 64 },
  fieldEntry: { width: 180, height: 70 },
  topicGroup: { width: 220, height: 110 },
  // Detail nodes
  topicDetail: { width: 420, height: 200 },
  projectDetail: { width: 320, height: 160 },
  expertDetail: { width: 320, height: 200 },
  supervisorDetail: { width: 320, height: 180 },
  companyDetail: { width: 320, height: 150 },
  universityDetail: { width: 320, height: 150 },
  studentDetail: { width: 320, height: 180 },
}

const elk = new ELK()

export async function applyElkLayout(nodes: Node[], edges: Edge[]): Promise<Node[]> {
  const visibleNodes = nodes.filter(n => !n.hidden)
  const visibleEdges = edges.filter(e => !e.hidden)

  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': 'DOWN',
      'elk.spacing.nodeNode': '60',
      'elk.layered.spacing.nodeNodeBetweenLayers': '120',
      'elk.spacing.edgeNode': '40',
      'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
    },
    children: visibleNodes.map(n => ({
      id: n.id,
      width: NODE_DIMENSIONS[n.type ?? '']?.width ?? 320,
      height: NODE_DIMENSIONS[n.type ?? '']?.height ?? 180,
    })),
    edges: visibleEdges.map(e => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  }

  const layout = await elk.layout(elkGraph)
  const positionMap = new Map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (layout.children ?? []).map((n: any) => [n.id, { x: n.x ?? 0, y: n.y ?? 0 }])
  )

  return nodes.map(n => ({
    ...n,
    position: positionMap.get(n.id) ?? n.position,
  }))
}
