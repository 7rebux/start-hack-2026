import { useMemo } from "react"
import { useParams } from "react-router-dom"
import ReactFlow, { Background, Controls, useNodesState, useEdgesState } from "reactflow"
import "reactflow/dist/style.css"
import topicsData from "../../mock-data/topics.json"
import expertsData from "../../mock-data/experts.json"
import supervisorsData from "../../mock-data/supervisors.json"
import universitiesData from "../../mock-data/universities.json"
import companiesData from "../../mock-data/companies.json"
import fieldsData from "../../mock-data/fields.json"
import TopicNode from "../components/nodes/TopicNode"
import ExpertNode from "../components/nodes/ExpertNode"
import SupervisorNode from "../components/nodes/SupervisorNode"
import UniversityNode from "../components/nodes/UniversityNode"
import CompanyNode from "../components/nodes/CompanyNode"
import type { Topic } from "../types/topic"
import type { Expert, Company } from "../types/booking"
import type { Supervisor, University } from "../types/entities"

const nodeTypes = {
  topicNode: TopicNode,
  expertNode: ExpertNode,
  supervisorNode: SupervisorNode,
  universityNode: UniversityNode,
  companyNode: CompanyNode,
}

function resolveFields(ids: string[]) {
  return ids.map((id) => fieldsData.find((f) => f.id === id)?.name ?? id)
}

function buildGraph(topic: Topic) {
  const nodes: object[] = [
    { id: topic.id, type: "topicNode", position: { x: 0, y: 0 }, data: { ...topic, fieldNames: resolveFields(topic.fieldIds) } },
  ]
  const edges: object[] = []

  if (topic.companyId) {
    const company = (companiesData as Company[]).find((c) => c.id === topic.companyId)
    if (company) {
      nodes.push({ id: company.id, type: "companyNode", position: { x: -550, y: 0 }, data: company })
      edges.push({ id: `${topic.id}-${company.id}`, source: topic.id, target: company.id })
    }
  }

  if (topic.universityId) {
    const university = (universitiesData as University[]).find((u) => u.id === topic.universityId)
    if (university) {
      nodes.push({ id: university.id, type: "universityNode", position: { x: -550, y: 0 }, data: university })
      edges.push({ id: `${topic.id}-${university.id}`, source: topic.id, target: university.id })
    }
  }

  topic.supervisorIds.forEach((supervisorId, i) => {
    const supervisor = (supervisorsData as Supervisor[]).find((s) => s.id === supervisorId)
    if (supervisor) {
      nodes.push({ id: supervisor.id, type: "supervisorNode", position: { x: -250, y: 250 + i * 200 }, data: { ...supervisor, fieldNames: resolveFields(supervisor.fieldIds) } })
      edges.push({ id: `${topic.id}-${supervisor.id}`, source: topic.id, target: supervisor.id })
    }
  })

  topic.expertIds.forEach((expertId, i) => {
    const expert = (expertsData as Expert[]).find((e) => e.id === expertId)
    if (expert) {
      nodes.push({ id: expert.id, type: "expertNode", position: { x: 350, y: 250 + i * 200 }, data: { ...expert, fieldNames: resolveFields(expert.fieldIds) } })
      edges.push({ id: `${topic.id}-${expert.id}`, source: topic.id, target: expert.id })
    }
  })

  return { nodes, edges }
}

function TopicFlow({ topic }: { topic: Topic }) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => buildGraph(topic), [topic])
  const [nodes, , onNodesChange] = useNodesState(initialNodes as never[])
  const [edges, , onEdgesChange] = useEdgesState(initialEdges as never[])

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        nodesConnectable={false}
        elementsSelectable={false}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export function TopicViewPage() {
  const { topicId } = useParams<{ topicId: string }>()
  const topic = (topicsData as Topic[]).find((t) => t.id === topicId)

  if (!topic) {
    return (
      <div className="flex items-center justify-center w-screen h-screen text-gray-500">
        Topic not found
      </div>
    )
  }

  return <TopicFlow topic={topic} />
}
