import { useCallback, useEffect, useMemo, useState } from "react"
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
  // Maps nodeId/edgeId → owning projectId for project-level graph elements
  const projectNodeMap = new Map<string, string>()
  const projectEdgeSet = new Set<string>()

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

    const addProjectEdge = (edgeId: string, source: string, target: string) => {
      projectEdgeSet.add(edgeId)
      edges.push({ id: edgeId, source, target })
    }

    // Company
    if (project.companyId) {
      if (!nodeIds.has(project.companyId)) {
        const company = (companiesData as Company[]).find((c) => c.id === project.companyId)
        if (company) {
          nodeIds.add(company.id)
          projectNodeMap.set(company.id, project.id)
          nodes.push({ id: company.id, type: "companyNode", position: { x: projX - 250, y: -600 }, data: company })
        }
      }
      if (nodeIds.has(project.companyId)) {
        addProjectEdge(`${project.id}-${project.companyId}`, project.id, project.companyId)
      }
    }

    // University
    if (project.universityId) {
      if (!nodeIds.has(project.universityId)) {
        const university = (universitiesData as University[]).find((u) => u.id === project.universityId)
        if (university) {
          nodeIds.add(university.id)
          projectNodeMap.set(university.id, project.id)
          nodes.push({ id: university.id, type: "universityNode", position: { x: projX + 250, y: -600 }, data: university })
        }
      }
      if (nodeIds.has(project.universityId)) {
        addProjectEdge(`${project.id}-${project.universityId}`, project.id, project.universityId)
      }
    }

    // Supervisors
    project.supervisorIds.forEach((supervisorId, si) => {
      if (!nodeIds.has(supervisorId)) {
        const supervisor = (supervisorsData as Supervisor[]).find((s) => s.id === supervisorId)
        if (supervisor) {
          nodeIds.add(supervisor.id)
          projectNodeMap.set(supervisor.id, project.id)
          nodes.push({ id: supervisor.id, type: "supervisorNode", position: { x: projX - 250, y: -600 - si * 200 }, data: { ...supervisor, fieldNames: resolveFields(supervisor.fieldIds) } })
        }
      }
      if (nodeIds.has(supervisorId)) {
        addProjectEdge(`${project.id}-${supervisorId}`, project.id, supervisorId)
      }
    })

    // Experts
    project.expertIds.forEach((expertId, ei) => {
      if (!nodeIds.has(expertId)) {
        const expert = (expertsData as Expert[]).find((e) => e.id === expertId)
        if (expert) {
          nodeIds.add(expert.id)
          projectNodeMap.set(expert.id, project.id)
          nodes.push({ id: expert.id, type: "expertNode", position: { x: projX + 250, y: -600 - ei * 200 }, data: { ...expert, fieldNames: resolveFields(expert.fieldIds) } })
        }
      }
      if (nodeIds.has(expertId)) {
        addProjectEdge(`${project.id}-${expertId}`, project.id, expertId)
      }
    })

    // Student
    const student = (studentsData as Student[]).find((s) => s.id === project.studentId)
    if (student) {
      if (!nodeIds.has(student.id)) {
        nodeIds.add(student.id)
        projectNodeMap.set(student.id, project.id)
        nodes.push({ id: student.id, type: "studentNode", position: { x: projX, y: -650 }, data: student })
      }
      addProjectEdge(`${project.id}-${student.id}`, project.id, student.id)
      if (nodeIds.has(student.universityId)) {
        addProjectEdge(`${student.id}-${student.universityId}`, student.id, student.universityId)
      }
    }
  })

  return { nodes, edges, projectNodeMap, projectEdgeSet }
}

function TopicFlow({ topic }: { topic: Topic }) {
  const { nodes: initialNodes, edges: initialEdges, projectNodeMap, projectEdgeSet } = useMemo(() => buildGraph(topic), [topic])
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())

  const toggleProject = useCallback((projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev)
      if (next.has(projectId)) next.delete(projectId)
      else next.add(projectId)
      return next
    })
  }, [])

  const nodes = useMemo(() =>
    (initialNodes as Array<{ id: string; type: string; data: object; position: object }>).map((node) => {
      const owningProject = projectNodeMap.get(node.id)
      const hidden = owningProject !== undefined && !expandedProjects.has(owningProject)
      if (node.type === "projectNode") {
        return {
          ...node,
          data: {
            ...node.data,
            expanded: expandedProjects.has(node.id),
            onToggle: () => toggleProject(node.id),
          },
        }
      }
      return { ...node, hidden }
    }),
    [initialNodes, projectNodeMap, expandedProjects, toggleProject]
  )

  const edges = useMemo(() =>
    (initialEdges as Array<{ id: string; source: string; target: string }>).map((edge) => {
      const hidden = projectEdgeSet.has(edge.id) && !expandedProjects.has(
        projectNodeMap.get(edge.target) ?? projectNodeMap.get(edge.source) ?? ""
      )
      return { ...edge, hidden }
    }),
    [initialEdges, projectEdgeSet, projectNodeMap, expandedProjects]
  )

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes as never[])
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges as never[])

  useEffect(() => {
    setRfNodes((prev) => {
      const prevPositions = new Map((prev as Array<{ id: string; position: object }>).map((n) => [n.id, n.position]))
      return (nodes as Array<{ id: string; position: object }>).map((n) => ({
        ...n,
        position: prevPositions.get(n.id) ?? n.position,
      })) as never[]
    })
  }, [nodes, setRfNodes])
  useEffect(() => { setRfEdges(edges as never[]) }, [edges, setRfEdges])

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
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
