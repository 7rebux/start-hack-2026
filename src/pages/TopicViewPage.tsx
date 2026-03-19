import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
} from "reactflow";
import "reactflow/dist/style.css";
import ELK from "elkjs/lib/elk.bundled.js";
import topicsData from "../../mock-data/topics.json";
import expertsData from "../../mock-data/experts.json";
import supervisorsData from "../../mock-data/supervisors.json";
import universitiesData from "../../mock-data/universities.json";
import companiesData from "../../mock-data/companies.json";
import fieldsData from "../../mock-data/fields.json";
import projectsData from "../../mock-data/projects.json";
import studentsData from "../../mock-data/students.json";
import TopicNode from "../components/nodes/TopicNode";
import ExpertNode from "../components/nodes/ExpertNode";
import SupervisorNode from "../components/nodes/SupervisorNode";
import UniversityNode from "../components/nodes/UniversityNode";
import CompanyNode from "../components/nodes/CompanyNode";
import ProjectNode from "../components/nodes/ProjectNode";
import StudentNode from "../components/nodes/StudentNode";
import type { Topic } from "../types/topic";
import type { Expert, Company } from "../types/booking";
import type {
  Supervisor,
  University,
  Project,
  Student,
} from "../types/entities";

const nodeTypes = {
  topicNode: TopicNode,
  expertNode: ExpertNode,
  supervisorNode: SupervisorNode,
  universityNode: UniversityNode,
  companyNode: CompanyNode,
  projectNode: ProjectNode,
  studentNode: StudentNode,
};

const NODE_DIMENSIONS: Record<string, { width: number; height: number }> = {
  topicNode: { width: 420, height: 200 },
  projectNode: { width: 320, height: 160 },
  expertNode: { width: 320, height: 200 },
  supervisorNode: { width: 320, height: 180 },
  companyNode: { width: 320, height: 150 },
  universityNode: { width: 320, height: 150 },
  studentNode: { width: 320, height: 180 },
};

const elk = new ELK();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function applyElkLayout(nodes: any[], edges: any[]): Promise<any[]> {
  const visibleNodes = nodes.filter((n) => !n.hidden);
  const visibleEdges = edges.filter((e) => !e.hidden);

  const elkGraph = {
    id: "root",
    layoutOptions: {
      "elk.algorithm": "layered",
      "elk.direction": "DOWN",
      "elk.spacing.nodeNode": "80",
      "elk.layered.spacing.nodeNodeBetweenLayers": "160",
      "elk.spacing.edgeNode": "60",
      "elk.layered.crossingMinimization.strategy": "LAYER_SWEEP",
      "elk.layered.nodePlacement.strategy": "NETWORK_SIMPLEX",
    },
    children: visibleNodes.map((n) => ({
      id: n.id,
      width: NODE_DIMENSIONS[n.type]?.width ?? 320,
      height: NODE_DIMENSIONS[n.type]?.height ?? 180,
    })),
    edges: visibleEdges.map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    })),
  };

  const layout = await elk.layout(elkGraph);
  const positionMap = new Map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (layout.children ?? []).map((n: any) => [
      n.id,
      { x: n.x ?? 0, y: n.y ?? 0 },
    ]),
  );

  return nodes.map((n) => ({
    ...n,
    position: positionMap.get(n.id) ?? n.position,
  }));
}

function resolveFields(ids: string[]) {
  return ids.map((id) => fieldsData.find((f) => f.id === id)?.name ?? id);
}

function buildGraph(topic: Topic) {
  const nodeIds = new Set<string>([topic.id]);
  const projectNodeMap = new Map<string, string>();
  const projectEdgeSet = new Set<string>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodes: any[] = [
    {
      id: topic.id,
      type: "topicNode",
      position: { x: 0, y: 0 },
      data: { ...topic, fieldNames: resolveFields(topic.fieldIds) },
    },
  ];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const edges: any[] = [];

  if (topic.companyId) {
    const company = (companiesData as Company[]).find(
      (c) => c.id === topic.companyId,
    );
    if (company) {
      nodeIds.add(company.id);
      nodes.push({
        id: company.id,
        type: "companyNode",
        position: { x: 0, y: 0 },
        data: company,
      });
      edges.push({
        id: `${topic.id}-${company.id}`,
        source: topic.id,
        target: company.id,
      });
    }
  }

  if (topic.universityId) {
    const university = (universitiesData as University[]).find(
      (u) => u.id === topic.universityId,
    );
    if (university) {
      nodeIds.add(university.id);
      nodes.push({
        id: university.id,
        type: "universityNode",
        position: { x: 0, y: 0 },
        data: university,
      });
      edges.push({
        id: `${topic.id}-${university.id}`,
        source: topic.id,
        target: university.id,
      });
    }
  }

  topic.supervisorIds.forEach((supervisorId) => {
    const supervisor = (supervisorsData as Supervisor[]).find(
      (s) => s.id === supervisorId,
    );
    if (supervisor) {
      nodeIds.add(supervisor.id);
      nodes.push({
        id: supervisor.id,
        type: "supervisorNode",
        position: { x: 0, y: 0 },
        data: { ...supervisor, fieldNames: resolveFields(supervisor.fieldIds) },
      });
      edges.push({
        id: `${topic.id}-${supervisor.id}`,
        source: topic.id,
        target: supervisor.id,
      });
    }
  });

  topic.expertIds.forEach((expertId) => {
    const expert = (expertsData as Expert[]).find((e) => e.id === expertId);
    if (expert) {
      nodeIds.add(expert.id);
      nodes.push({
        id: expert.id,
        type: "expertNode",
        position: { x: 0, y: 0 },
        data: { ...expert, fieldNames: resolveFields(expert.fieldIds) },
      });
      edges.push({
        id: `${topic.id}-${expert.id}`,
        source: topic.id,
        target: expert.id,
      });
    }
  });

  const projects = (projectsData as Project[]).filter(
    (p) => p.topicId === topic.id,
  );
  projects.forEach((project) => {
    nodeIds.add(project.id);
    nodes.push({
      id: project.id,
      type: "projectNode",
      position: { x: 0, y: 0 },
      data: project,
    });
    edges.push({
      id: `${topic.id}-${project.id}`,
      source: topic.id,
      target: project.id,
    });

    const addProjectEdge = (edgeId: string, source: string, target: string) => {
      projectEdgeSet.add(edgeId);
      edges.push({ id: edgeId, source, target });
    };

    if (project.companyId) {
      if (!nodeIds.has(project.companyId)) {
        const company = (companiesData as Company[]).find(
          (c) => c.id === project.companyId,
        );
        if (company) {
          nodeIds.add(company.id);
          projectNodeMap.set(company.id, project.id);
          nodes.push({
            id: company.id,
            type: "companyNode",
            position: { x: 0, y: 0 },
            data: company,
          });
        }
      }
      if (nodeIds.has(project.companyId)) {
        addProjectEdge(
          `${project.id}-${project.companyId}`,
          project.id,
          project.companyId,
        );
      }
    }

    if (project.universityId) {
      if (!nodeIds.has(project.universityId)) {
        const university = (universitiesData as University[]).find(
          (u) => u.id === project.universityId,
        );
        if (university) {
          nodeIds.add(university.id);
          projectNodeMap.set(university.id, project.id);
          nodes.push({
            id: university.id,
            type: "universityNode",
            position: { x: 0, y: 0 },
            data: university,
          });
        }
      }
      if (nodeIds.has(project.universityId)) {
        addProjectEdge(
          `${project.id}-${project.universityId}`,
          project.id,
          project.universityId,
        );
      }
    }

    project.supervisorIds.forEach((supervisorId) => {
      if (!nodeIds.has(supervisorId)) {
        const supervisor = (supervisorsData as Supervisor[]).find(
          (s) => s.id === supervisorId,
        );
        if (supervisor) {
          nodeIds.add(supervisor.id);
          projectNodeMap.set(supervisor.id, project.id);
          nodes.push({
            id: supervisor.id,
            type: "supervisorNode",
            position: { x: 0, y: 0 },
            data: {
              ...supervisor,
              fieldNames: resolveFields(supervisor.fieldIds),
            },
          });
        }
      }
      if (nodeIds.has(supervisorId)) {
        addProjectEdge(
          `${project.id}-${supervisorId}`,
          project.id,
          supervisorId,
        );
      }
    });

    project.expertIds.forEach((expertId) => {
      if (!nodeIds.has(expertId)) {
        const expert = (expertsData as Expert[]).find((e) => e.id === expertId);
        if (expert) {
          nodeIds.add(expert.id);
          projectNodeMap.set(expert.id, project.id);
          nodes.push({
            id: expert.id,
            type: "expertNode",
            position: { x: 0, y: 0 },
            data: { ...expert, fieldNames: resolveFields(expert.fieldIds) },
          });
        }
      }
      if (nodeIds.has(expertId)) {
        addProjectEdge(`${project.id}-${expertId}`, project.id, expertId);
      }
    });

    const student = (studentsData as Student[]).find(
      (s) => s.id === project.studentId,
    );
    if (student) {
      if (!nodeIds.has(student.id)) {
        nodeIds.add(student.id);
        projectNodeMap.set(student.id, project.id);
        nodes.push({
          id: student.id,
          type: "studentNode",
          position: { x: 0, y: 0 },
          data: student,
        });
      }
      addProjectEdge(`${project.id}-${student.id}`, project.id, student.id);
      if (nodeIds.has(student.universityId)) {
        addProjectEdge(
          `${student.id}-${student.universityId}`,
          student.id,
          student.universityId,
        );
      }
    }
  });

  return { nodes, edges, projectNodeMap, projectEdgeSet };
}

function TopicFlow({ topic }: { topic: Topic }) {
  const {
    nodes: allNodes,
    edges: allEdges,
    projectNodeMap,
    projectEdgeSet,
  } = useMemo(() => buildGraph(topic), [topic]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rfInstance, setRfInstance] = useState<any>(null);

  const toggleProject = useCallback((projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }, []);

  const { visibleNodes, visibleEdges } = useMemo(() => {
    const visibleNodes = allNodes.map((node) => {
      const owningProject = projectNodeMap.get(node.id);
      const hidden =
        owningProject !== undefined && !expandedProjects.has(owningProject);
      if (node.type === "projectNode") {
        return {
          ...node,
          data: {
            ...node.data,
            expanded: expandedProjects.has(node.id),
            onToggle: () => toggleProject(node.id),
          },
        };
      }
      return { ...node, hidden };
    });

    const visibleEdges = allEdges.map((edge) => {
      const hidden =
        projectEdgeSet.has(edge.id) &&
        !expandedProjects.has(
          projectNodeMap.get(edge.target) ??
            projectNodeMap.get(edge.source) ??
            "",
        );
      return { ...edge, hidden };
    });

    return { visibleNodes, visibleEdges };
  }, [
    allNodes,
    allEdges,
    projectNodeMap,
    projectEdgeSet,
    expandedProjects,
    toggleProject,
  ]);

  const runLayout = useCallback(() => {
    applyElkLayout(visibleNodes, visibleEdges).then((layoutedNodes) => {
      setRfNodes(layoutedNodes as never[]);
      setRfEdges(visibleEdges as never[]);
    });
  }, [visibleNodes, visibleEdges, setRfNodes, setRfEdges]);

  // Re-run ELK layout whenever visible nodes/edges change
  useEffect(() => {
    runLayout();
  }, [runLayout]);

  // Fit view after layout updates
  useEffect(() => {
    if (rfInstance && rfNodes.length > 0) {
      setTimeout(() => rfInstance.fitView({ padding: 0.1, duration: 300 }), 50);
    }
  }, [rfNodes, rfInstance]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onInit={setRfInstance}
        nodesConnectable={false}
        elementsSelectable={false}
        defaultEdgeOptions={{ type: "step" }}
        connectionLineType={ConnectionLineType.SmoothStep}
      >
        <Background />
        <Controls />
        <Panel position="top-right">
          <button
            onClick={runLayout}
            className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Auto-layout
          </button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function TopicViewPage() {
  const { topicId } = useParams<{ topicId: string }>();
  const topic = (topicsData as Topic[]).find((t) => t.id === topicId);

  if (!topic) {
    return (
      <div className="flex items-center justify-center w-screen h-screen text-gray-500">
        Topic not found
      </div>
    );
  }

  return <TopicFlow topic={topic} />;
}
