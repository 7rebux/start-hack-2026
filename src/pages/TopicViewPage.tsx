import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ReactFlow, {
  Background,
  Controls,
  Panel,
  useNodesState,
  useEdgesState,
  ConnectionLineType,
  type Node,
} from "reactflow";
import { AnimatePresence } from "framer-motion";
import { TopicViewDetailPanel } from "../components/TopicViewDetailPanel";
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

export const ActiveNodeContext = createContext<string | null>(null);
export function useActiveNodeId() { return useContext(ActiveNodeContext); }

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
  expertNode: { width: 320, height: 160 },
  supervisorNode: { width: 320, height: 180 },
  companyNode: { width: 320, height: 140 },
  universityNode: { width: 320, height: 130 },
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
  const topicChildIds = new Set<string>();
  const topicEdgeSet = new Set<string>();

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
      topicChildIds.add(company.id);
      nodes.push({
        id: company.id,
        type: "companyNode",
        position: { x: 0, y: 0 },
        data: company,
      });
      const edgeId = `${topic.id}-${company.id}`;
      topicEdgeSet.add(edgeId);
      edges.push({ id: edgeId, source: topic.id, target: company.id });
    }
  }

  if (topic.universityId) {
    const university = (universitiesData as University[]).find(
      (u) => u.id === topic.universityId,
    );
    if (university) {
      nodeIds.add(university.id);
      topicChildIds.add(university.id);
      nodes.push({
        id: university.id,
        type: "universityNode",
        position: { x: 0, y: 0 },
        data: university,
      });
      const edgeId = `${topic.id}-${university.id}`;
      topicEdgeSet.add(edgeId);
      edges.push({ id: edgeId, source: topic.id, target: university.id });
    }
  }

  topic.supervisorIds.forEach((supervisorId) => {
    const supervisor = (supervisorsData as Supervisor[]).find(
      (s) => s.id === supervisorId,
    );
    if (supervisor) {
      nodeIds.add(supervisor.id);
      topicChildIds.add(supervisor.id);
      nodes.push({
        id: supervisor.id,
        type: "supervisorNode",
        position: { x: 0, y: 0 },
        data: { ...supervisor, fieldNames: resolveFields(supervisor.fieldIds) },
      });
      const edgeId = `${topic.id}-${supervisor.id}`;
      topicEdgeSet.add(edgeId);
      edges.push({ id: edgeId, source: topic.id, target: supervisor.id });
    }
  });

  topic.expertIds.forEach((expertId) => {
    const expert = (expertsData as Expert[]).find((e) => e.id === expertId);
    if (expert) {
      nodeIds.add(expert.id);
      topicChildIds.add(expert.id);
      nodes.push({
        id: expert.id,
        type: "expertNode",
        position: { x: 0, y: 0 },
        data: { ...expert, fieldNames: resolveFields(expert.fieldIds) },
      });
      const edgeId = `${topic.id}-${expert.id}`;
      topicEdgeSet.add(edgeId);
      edges.push({ id: edgeId, source: topic.id, target: expert.id });
    }
  });

  const projects = (projectsData as Project[]).filter(
    (p) => p.topicId === topic.id,
  );
  projects.forEach((project) => {
    nodeIds.add(project.id);
    topicChildIds.add(project.id);
    nodes.push({
      id: project.id,
      type: "projectNode",
      position: { x: 0, y: 0 },
      data: project,
    });
    const topicProjectEdgeId = `${topic.id}-${project.id}`;
    topicEdgeSet.add(topicProjectEdgeId);
    edges.push({
      id: topicProjectEdgeId,
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

  return { nodes, edges, projectNodeMap, projectEdgeSet, topicChildIds, topicEdgeSet };
}

function TopicFlow({ topic }: { topic: Topic }) {
  const {
    nodes: allNodes,
    edges: allEdges,
    projectNodeMap,
    projectEdgeSet,
    topicChildIds,
    topicEdgeSet,
  } = useMemo(() => buildGraph(topic), [topic]);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );
  const [topicExpanded, setTopicExpanded] = useState(false);
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [, setRfInstance] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rfInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activeNode, setActiveNode] = useState<{ type: string; data: any } | null>(null);
  // Ref so runLayout can read current node positions without being a dependency
  const rfNodesRef = useRef(rfNodes);
  useEffect(() => { rfNodesRef.current = rfNodes; }, [rfNodes]);
  const isFirstLayout = useRef(true);

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setActiveNode((prev) =>
      prev && prev.data.id === node.data.id ? null : { type: node.type!, data: node.data },
    );
  }, []);

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
      if (node.type === "topicNode") {
        return {
          ...node,
          data: {
            ...node.data,
            expanded: topicExpanded,
            onToggle: () => setTopicExpanded((prev) => !prev),
          },
        };
      }
      if (topicChildIds.has(node.id) && !topicExpanded) {
        return { ...node, hidden: true };
      }
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
      const owningProject = projectNodeMap.get(node.id);
      const hidden =
        owningProject !== undefined && !expandedProjects.has(owningProject);
      return { ...node, hidden };
    });

    const visibleEdges = allEdges.map((edge) => {
      if (topicEdgeSet.has(edge.id) && !topicExpanded) {
        return { ...edge, hidden: true };
      }
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
    topicChildIds,
    topicEdgeSet,
    topicExpanded,
    expandedProjects,
    toggleProject,
  ]);

  const runLayout = useCallback((fitAfter = false) => {
    const first = isFirstLayout.current;
    applyElkLayout(visibleNodes, visibleEdges).then((layoutedNodes: any[]) => {
      let finalNodes = layoutedNodes;

      if (!first) {
        // Map of node IDs that are currently visible on screen → their positions
        const currentPositions = new Map(
          rfNodesRef.current
            .filter((n) => !n.hidden)
            .map((n) => [n.id, n.position]),
        );

        // Compute offset so newly-appearing nodes are placed relative to
        // where the topic card currently sits (not ELK's origin).
        const currentTopicPos = currentPositions.get(topic.id);
        const elkTopicPos = layoutedNodes.find((n) => n.id === topic.id)?.position;
        const dx = currentTopicPos && elkTopicPos ? currentTopicPos.x - elkTopicPos.x : 0;
        const dy = currentTopicPos && elkTopicPos ? currentTopicPos.y - elkTopicPos.y : 0;

        finalNodes = layoutedNodes.map((n) => {
          // Already on screen → keep exact position (no jump)
          if (currentPositions.has(n.id)) {
            return { ...n, position: currentPositions.get(n.id) };
          }
          // Newly revealed → use ELK position shifted by the topic delta
          return { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } };
        });
      }

      setRfNodes(finalNodes as never[]);
      setRfEdges(visibleEdges as never[]);
      if (fitAfter || first) {
        isFirstLayout.current = false;
        setTimeout(
          () => rfInstanceRef.current?.fitView({ padding: 0.5, maxZoom: 0.7, duration: 300 }),
          50,
        );
      }
    });
  }, [visibleNodes, visibleEdges, setRfNodes, setRfEdges, topic.id]);

  // Re-run ELK layout whenever visible nodes/edges change
  useEffect(() => {
    runLayout(false);
  }, [runLayout]);

  return (
    <ActiveNodeContext.Provider value={activeNode?.data.id ?? null}>
    <>
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onInit={(instance) => { rfInstanceRef.current = instance; setRfInstance(instance); }}
          nodesConnectable={false}
          elementsSelectable={false}
          onNodeClick={onNodeClick}
          onPaneClick={() => setActiveNode(null)}
          defaultEdgeOptions={{ type: "step" }}
          connectionLineType={ConnectionLineType.SmoothStep}
        >
          <Background />
          <Controls />
          <Panel position="top-right">
            <button
              onClick={() => runLayout(true)}
              className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors z-50"
            >
              Auto-layout
            </button>
          </Panel>
        </ReactFlow>
      </div>
      <AnimatePresence>
        {activeNode && (
          <TopicViewDetailPanel
            node={activeNode}
            onClose={() => setActiveNode(null)}
          />
        )}
      </AnimatePresence>
    </>
    </ActiveNodeContext.Provider>
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
