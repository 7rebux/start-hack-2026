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
import projectsData from "../../mock-data/projects.json"
import studentsData from "../../mock-data/students.json"
import TopicNode from "../components/nodes/TopicNode"
import ExpertNode from "../components/nodes/ExpertNode"
import SupervisorNode from "../components/nodes/SupervisorNode"
import UniversityNode from "../components/nodes/UniversityNode"
import CompanyNode from "../components/nodes/CompanyNode"
import ProjectNode from "../components/nodes/ProjectNode"
import StudentNode from "../components/nodes/StudentNode"
import type { Topic } from "../types/topic"
import type { Expert, Company } from "../types/booking"
import type { Supervisor, University, Project, Student } from "../types/entities"

const nodeTypes = {
  topicNode: TopicNode,
  expertNode: ExpertNode,
  supervisorNode: SupervisorNode,
  universityNode: UniversityNode,
  companyNode: CompanyNode,
  projectNode: ProjectNode,
  studentNode: StudentNode,
}

function resolveFields(ids: string[]) {
  return ids.map((id) => fieldsData.find((f) => f.id === id)?.name ?? id)
}

function buildGraph(topic: Topic) {
  const nodeIds = new Set<string>([topic.id])
  const nodes: object[] = [
    { id: topic.id, type: "topicNode", position: { x: 0, y: 0 }, data: { ...topic, fieldNames: resolveFields(topic.fieldIds) } },
  ]
  const edges: object[] = []

  if (topic.companyId) {
    const company = (companiesData as Company[]).find((c) => c.id === topic.companyId)
    if (company) {
      nodeIds.add(company.id)
      nodes.push({ id: company.id, type: "companyNode", position: { x: -550, y: 0 }, data: company })
      edges.push({ id: `${topic.id}-${company.id}`, source: topic.id, target: company.id })
    }
  }

  if (topic.universityId) {
    const university = (universitiesData as University[]).find((u) => u.id === topic.universityId)
    if (university) {
      nodeIds.add(university.id)
      nodes.push({ id: university.id, type: "universityNode", position: { x: -550, y: 0 }, data: university })
      edges.push({ id: `${topic.id}-${university.id}`, source: topic.id, target: university.id })
    }
  }

  topic.supervisorIds.forEach((supervisorId, i) => {
    const supervisor = (supervisorsData as Supervisor[]).find((s) => s.id === supervisorId)
    if (supervisor) {
      nodeIds.add(supervisor.id)
      nodes.push({ id: supervisor.id, type: "supervisorNode", position: { x: -250, y: 250 + i * 200 }, data: { ...supervisor, fieldNames: resolveFields(supervisor.fieldIds) } })
      edges.push({ id: `${topic.id}-${supervisor.id}`, source: topic.id, target: supervisor.id })
    }
  })

  topic.expertIds.forEach((expertId, i) => {
    const expert = (expertsData as Expert[]).find((e) => e.id === expertId)
    if (expert) {
      nodeIds.add(expert.id)
      nodes.push({ id: expert.id, type: "expertNode", position: { x: 350, y: 250 + i * 200 }, data: { ...expert, fieldNames: resolveFields(expert.fieldIds) } })
      edges.push({ id: `${topic.id}-${expert.id}`, source: topic.id, target: expert.id })
    }
  })

  const projects = (projectsData as Project[]).filter((p) => p.topicId === topic.id)
  projects.forEach((project, i) => {
    const projX = i * 400 - (projects.length - 1) * 200
    nodeIds.add(project.id)
    nodes.push({ id: project.id, type: "projectNode", position: { x: projX, y: -350 }, data: project })
    edges.push({ id: `${topic.id}-${project.id}`, source: topic.id, target: project.id })

    // Company
    if (project.companyId) {
      if (!nodeIds.has(project.companyId)) {
        const company = (companiesData as Company[]).find((c) => c.id === project.companyId)
        if (company) {
          nodeIds.add(company.id)
          nodes.push({ id: company.id, type: "companyNode", position: { x: projX - 250, y: -600 }, data: company })
        }
      }
      if (nodeIds.has(project.companyId)) {
        edges.push({ id: `${project.id}-${project.companyId}`, source: project.id, target: project.companyId })
      }
    }

    // University
    if (project.universityId) {
      if (!nodeIds.has(project.universityId)) {
        const university = (universitiesData as University[]).find((u) => u.id === project.universityId)
        if (university) {
          nodeIds.add(university.id)
          nodes.push({ id: university.id, type: "universityNode", position: { x: projX + 250, y: -600 }, data: university })
        }
      }
      if (nodeIds.has(project.universityId)) {
        edges.push({ id: `${project.id}-${project.universityId}`, source: project.id, target: project.universityId })
      }
    }

    // Supervisors
    project.supervisorIds.forEach((supervisorId, si) => {
      if (!nodeIds.has(supervisorId)) {
        const supervisor = (supervisorsData as Supervisor[]).find((s) => s.id === supervisorId)
        if (supervisor) {
          nodeIds.add(supervisor.id)
          nodes.push({ id: supervisor.id, type: "supervisorNode", position: { x: projX - 250, y: -600 - si * 200 }, data: { ...supervisor, fieldNames: resolveFields(supervisor.fieldIds) } })
        }
      }
      if (nodeIds.has(supervisorId)) {
        edges.push({ id: `${project.id}-${supervisorId}`, source: project.id, target: supervisorId })
      }
    })

    // Experts
    project.expertIds.forEach((expertId, ei) => {
      if (!nodeIds.has(expertId)) {
        const expert = (expertsData as Expert[]).find((e) => e.id === expertId)
        if (expert) {
          nodeIds.add(expert.id)
          nodes.push({ id: expert.id, type: "expertNode", position: { x: projX + 250, y: -600 - ei * 200 }, data: { ...expert, fieldNames: resolveFields(expert.fieldIds) } })
        }
      }
      if (nodeIds.has(expertId)) {
        edges.push({ id: `${project.id}-${expertId}`, source: project.id, target: expertId })
      }
    })

    // Student
    const student = (studentsData as Student[]).find((s) => s.id === project.studentId)
    if (student) {
      if (!nodeIds.has(student.id)) {
        nodeIds.add(student.id)
        nodes.push({ id: student.id, type: "studentNode", position: { x: projX, y: -650 }, data: student })
      }
      edges.push({ id: `${project.id}-${student.id}`, source: project.id, target: student.id })
      if (nodeIds.has(student.universityId)) {
        edges.push({ id: `${student.id}-${student.universityId}`, source: student.id, target: student.universityId })
      }
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
