import { useState, useRef, useEffect, useMemo } from "react"
import Anthropic from "@anthropic-ai/sdk"
import { useAppStore } from "@/store/useAppStore"
import type { Project } from "@/types/entities"
import {
  supervisorById,
  expertById,
  companyById,
  universityById,
} from "@/data/index"
import projectsRaw from "../../mock-data/projects.json"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  FolderOpen,
  GraduationCap,
  Briefcase,
  Building2,
  Flag,
  Plus,
  X,
  Sparkles,
  Send,
  CheckCircle,
} from "lucide-react"

const projects = projectsRaw as Project[]

// ── Types ──────────────────────────────────────────────────────────────────

type TimelineEventKind =
  | "project_created"
  | "state_change"
  | "supervisor_added"
  | "expert_added"
  | "company_partnership"
  | "milestone"

interface TimelineEvent {
  id: string
  kind: TimelineEventKind
  date: string
  title: string
  description?: string
}

interface Milestone {
  id: string
  title: string
  date: string
  description?: string
}

// ── Helpers ────────────────────────────────────────────────────────────────

const STATE_ORDER = ["proposed", "applied", "agreed", "in_progress", "completed"]

function stateLabel(state: string): string {
  return {
    proposed: "Proposed",
    applied: "Applied",
    agreed: "Agreed",
    in_progress: "In Progress",
    completed: "Completed",
    withdrawn: "Withdrawn",
    rejected: "Rejected",
  }[state] ?? state
}

function interpolateDate(start: string, end: string, fraction: number): string {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  const span = e - s
  return new Date(s + span * fraction).toISOString().split("T")[0]
}

function buildTimelineEvents(project: Project, milestones: Milestone[]): TimelineEvent[] {
  const events: TimelineEvent[] = []

  // 1. Project created
  events.push({
    id: "created",
    kind: "project_created",
    date: project.createdAt.split("T")[0],
    title: "Project Created",
    description: project.title,
  })

  const start = project.createdAt
  const end = project.updatedAt

  // 2. Company partnership
  if (project.companyId) {
    const company = companyById[project.companyId]
    events.push({
      id: `company-${project.companyId}`,
      kind: "company_partnership",
      date: interpolateDate(start, end, 0.15),
      title: "Company Partnership",
      description: company?.name ?? project.companyId,
    })
  }

  // 3. Supervisors
  project.supervisorIds.forEach((sid, i) => {
    const s = supervisorById[sid]
    events.push({
      id: `supervisor-${sid}`,
      kind: "supervisor_added",
      date: interpolateDate(start, end, 0.2 + i * 0.02),
      title: "Supervisor Added",
      description: s ? `${s.title} ${s.firstName} ${s.lastName}` : sid,
    })
  })

  // 4. Experts
  project.expertIds.forEach((eid, i) => {
    const e = expertById[eid]
    events.push({
      id: `expert-${eid}`,
      kind: "expert_added",
      date: interpolateDate(start, end, 0.3 + i * 0.02),
      title: "Expert Added",
      description: e ? `${e.title} ${e.firstName} ${e.lastName}` : eid,
    })
  })

  // 5. State changes (skip index 0 = proposed, covered by project_created)
  const currentStateIdx = STATE_ORDER.indexOf(project.state)
  for (let i = 1; i <= currentStateIdx; i++) {
    const state = STATE_ORDER[i]
    const fraction = i / Math.max(currentStateIdx, 1)
    events.push({
      id: `state-${state}`,
      kind: "state_change",
      date: interpolateDate(start, end, fraction * 0.8 + 0.1),
      title: `State: ${stateLabel(state)}`,
    })
  }

  // 6. Milestones
  milestones.forEach((m) => {
    events.push({
      id: `milestone-${m.id}`,
      kind: "milestone",
      date: m.date,
      title: m.title,
      description: m.description,
    })
  })

  return events.sort((a, b) => a.date.localeCompare(b.date))
}

// ── ProjectSelector ────────────────────────────────────────────────────────

function ProjectSelector() {
  const { selectedProjectId, setSelectedProjectId } = useAppStore()

  return (
    <div className="flex items-center gap-3">
      <h1 className="text-xl font-semibold">Companion</h1>
      <Select value={selectedProjectId ?? ""} onValueChange={(v) => setSelectedProjectId(v || null)}>
        <SelectTrigger className="w-72">
          <SelectValue placeholder="Select a project…" />
        </SelectTrigger>
        <SelectContent>
          {projects.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// ── TimelineEventRow ───────────────────────────────────────────────────────

const kindIcon: Record<TimelineEventKind, React.ReactNode> = {
  project_created: <FolderOpen className="size-4" />,
  state_change: <CheckCircle className="size-4" />,
  supervisor_added: <GraduationCap className="size-4" />,
  expert_added: <Briefcase className="size-4" />,
  company_partnership: <Building2 className="size-4" />,
  milestone: <Flag className="size-4 text-amber-500" />,
}

const kindColor: Record<TimelineEventKind, string> = {
  project_created: "bg-blue-100 text-blue-700",
  state_change: "bg-green-100 text-green-700",
  supervisor_added: "bg-purple-100 text-purple-700",
  expert_added: "bg-orange-100 text-orange-700",
  company_partnership: "bg-teal-100 text-teal-700",
  milestone: "bg-amber-100 text-amber-700",
}

interface TimelineEventRowProps {
  event: TimelineEvent
  onDelete?: () => void
}

function TimelineEventRow({ event, onDelete }: TimelineEventRowProps) {
  return (
    <div className="relative flex gap-4 pb-6">
      {/* Dot */}
      <div
        className={`z-10 flex size-9 flex-shrink-0 items-center justify-center rounded-full ${kindColor[event.kind]}`}
      >
        {kindIcon[event.kind]}
      </div>
      {/* Content */}
      <div className="flex flex-1 flex-col pt-1.5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium leading-none">{event.title}</p>
            {event.description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{event.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-muted-foreground">{event.date}</span>
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-muted-foreground hover:text-destructive transition-colors"
                aria-label="Delete milestone"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── ProjectTimeline ────────────────────────────────────────────────────────

interface ProjectTimelineProps {
  project: Project | null
  milestones: Milestone[]
  onAddMilestone: (m: Milestone) => void
  onDeleteMilestone: (id: string) => void
}

function ProjectTimeline({ project, milestones, onAddMilestone, onDeleteMilestone }: ProjectTimelineProps) {
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")

  function handleSave() {
    if (!title.trim() || !date) return
    onAddMilestone({
      id: crypto.randomUUID(),
      title: title.trim(),
      date,
      description: description.trim() || undefined,
    })
    setTitle("")
    setDate("")
    setDescription("")
    setShowForm(false)
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <FolderOpen className="mx-auto mb-3 size-10 opacity-30" />
          <p className="text-sm">Select a project to view its timeline</p>
        </div>
      </div>
    )
  }

  const events = buildTimelineEvents(project, milestones)
  const milestoneIdSet = new Set(milestones.map((m) => `milestone-${m.id}`))

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[17px] top-0 bottom-0 w-px bg-border" />
        <div className="space-y-0">
          {events.map((event) => (
            <TimelineEventRow
              key={event.id}
              event={event}
              onDelete={
                milestoneIdSet.has(event.id)
                  ? () => onDeleteMilestone(event.id.replace("milestone-", ""))
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Add milestone */}
      {showForm ? (
        <div className="rounded-lg border p-4 space-y-3">
          <p className="text-sm font-medium">New Milestone</p>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="resize-none"
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} disabled={!title.trim() || !date}>
              Save
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={() => setShowForm(true)}
        >
          <Plus className="size-4 mr-1.5" />
          Add milestone
        </Button>
      )}
    </div>
  )
}

// ── CompanionChat ──────────────────────────────────────────────────────────

const client = new Anthropic({
  apiKey: "not-needed",
  baseURL: `${window.location.origin}/api/ai`,
  dangerouslyAllowBrowser: true,
})

interface Message {
  role: "user" | "assistant"
  content: string
}

interface CompanionChatProps {
  project: Project | null
  timelineEvents: TimelineEvent[]
}

function CompanionChat({ project, timelineEvents }: CompanionChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const systemPrompt = useMemo(() => {
    if (!project) return ""
    const company = project.companyId ? companyById[project.companyId] : null
    const university = project.universityId ? universityById[project.universityId] : null
    const supervisorNames = project.supervisorIds.map((id) => {
      const s = supervisorById[id]
      return s ? `${s.title} ${s.firstName} ${s.lastName}` : id
    })
    const expertNames = project.expertIds.map((id) => {
      const e = expertById[id]
      return e ? `${e.title} ${e.firstName} ${e.lastName}` : id
    })
    const timelineText = timelineEvents
      .map((e) => `- [${e.date}] ${e.title}${e.description ? `: ${e.description}` : ""}`)
      .join("\n")

    return `You are the Studyond Companion — a dedicated AI assistant for thesis project tracking.

## Project Context
Title: ${project.title}
State: ${stateLabel(project.state)}
Description: ${project.description ?? "Not provided"}
University: ${university?.name ?? "Unknown"}
Company: ${company?.name ?? "None"}
Supervisors: ${supervisorNames.length > 0 ? supervisorNames.join(", ") : "None assigned"}
Experts: ${expertNames.length > 0 ? expertNames.join(", ") : "None assigned"}

## Timeline
${timelineText || "No events yet"}

## Your Role
Help with: progress overview, next steps, milestone planning, meeting prep.
Be concise, direct, practical. Use bullet points for action items.`
  }, [project, timelineEvents])

  // Reset chat when project changes
  useEffect(() => {
    if (!project) {
      setMessages([])
      return
    }
    setMessages([
      {
        role: "assistant",
        content: `Hi! I'm your Companion for **${project.title}**. Your project is currently **${stateLabel(project.state)}**. How can I help you move forward today?`,
      },
    ])
    setInput("")
  }, [project?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading || !project) return

    const userMessage: Message = { role: "user", content: text }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    const assistantMessage: Message = { role: "assistant", content: "" }
    setMessages([...newMessages, assistantMessage])

    try {
      const stream = client.messages.stream({
        model: "claude-opus-4-6",
        max_tokens: 2000,
        system: systemPrompt,
        messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
      })

      for await (const event of stream) {
        if (
          event.type === "content_block_delta" &&
          event.delta.type === "text_delta"
        ) {
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              role: "assistant",
              content:
                updated[updated.length - 1].content +
                (event.delta as { type: string; text: string }).text,
            }
            return updated
          })
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!project) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Sparkles className="mx-auto mb-3 size-10 opacity-30" />
          <p className="text-sm">Select a project to start chatting</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b flex-shrink-0">
        <Sparkles className="size-4 text-amber-500" />
        <span className="font-medium text-sm">AI Companion</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-0">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="mr-2 mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-md bg-secondary">
                <Sparkles className="size-3.5 text-amber-500" />
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground"
              }`}
            >
              {msg.content || (loading && i === messages.length - 1 ? "…" : "")}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 pt-4 border-t flex-shrink-0">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about next steps, milestones…"
          className="min-h-10 resize-none"
          rows={1}
          disabled={loading}
        />
        <Button
          size="icon"
          className="rounded-full flex-shrink-0"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          <Send className="size-4" />
        </Button>
      </div>
    </div>
  )
}

// ── CompanionPage ──────────────────────────────────────────────────────────

export function CompanionPage() {
  const { selectedProjectId } = useAppStore()
  const [milestones, setMilestones] = useState<Milestone[]>([])

  const project = selectedProjectId
    ? (projects.find((p) => p.id === selectedProjectId) ?? null)
    : null

  // Reset milestones when project changes
  useEffect(() => {
    setMilestones([])
  }, [selectedProjectId])

  const timelineEvents = useMemo(
    () => (project ? buildTimelineEvents(project, milestones) : []),
    [project, milestones]
  )

  function addMilestone(m: Milestone) {
    setMilestones((prev) => [...prev, m])
  }

  function deleteMilestone(id: string) {
    setMilestones((prev) => prev.filter((m) => m.id !== id))
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-6 py-4 border-b flex-shrink-0">
        <ProjectSelector />
        {project && (
          <span className="text-sm text-muted-foreground ml-auto">
            State: <span className="font-medium text-foreground">{stateLabel(project.state)}</span>
          </span>
        )}
      </header>

      {/* Main */}
      <div className="flex flex-1 min-h-0">
        {/* Timeline — 62% */}
        <div className="flex-[62] overflow-y-auto px-6 py-6 border-r">
          <ProjectTimeline
            project={project}
            milestones={milestones}
            onAddMilestone={addMilestone}
            onDeleteMilestone={deleteMilestone}
          />
        </div>

        {/* Chat — 38% */}
        <div className="flex-[38] flex flex-col px-6 py-6">
          <CompanionChat project={project} timelineEvents={timelineEvents} />
        </div>
      </div>
    </div>
  )
}

