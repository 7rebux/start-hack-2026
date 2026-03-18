import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  GraduationCap,
  Building2,
  Users,
  FileSearch,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock,
} from "lucide-react"
import studyondLogo from "./assets/studyond.svg"
import { ThesisAIChat } from "./components/ThesisAIChat"

const student = {
  name: "Nils",
  university: "ETH Zürich",
  stage: 2,
  interests: ["ML", "AI", "Data Science"],
}

const stages = [
  { id: 1, label: "Orientation" },
  { id: 2, label: "Topic & Supervisor" },
  { id: 3, label: "Planning" },
  { id: 4, label: "Execution" },
  { id: 5, label: "Writing" },
]

const matchedTopics = [
  { company: "Roche", title: "AI-driven drug discovery pipeline optimization", field: "Data Science" },
  { company: "UBS", title: "Sustainable finance scoring with NLP", field: "Finance / ML" },
  { company: "McKinsey", title: "Operational efficiency forecasting", field: "Operations / ML" },
]

const matchedSupervisors = [
  { name: "Prof. Dr. Birte Glimm", research: "Knowledge Graphs", university: "ETH Zürich" },
  { name: "Prof. Dr. Ce Zhang", research: "Machine Learning Systems", university: "ETH Zürich" },
]

const buildingBlocks = [
  { label: "Finding a Topic", status: "in-progress", note: "3 matches found" },
  { label: "Finding a Supervisor", status: "in-progress", note: "2 matched" },
  { label: "Company Partner", status: "open", note: "open" },
  { label: "Interview Partners", status: "open", note: "open" },
  { label: "Data Access", status: "open", note: "open" },
  { label: "Methodology", status: "open", note: "open" },
  { label: "Timeline & Milestones", status: "open", note: "open" },
  { label: "Literature", status: "open", note: "open" },
  { label: "Mentor & Feedback", status: "open", note: "open" },
]

const recentActivity = [
  { action: "Applied to topic", subject: "Sustainable Finance at UBS", time: "2h ago", icon: FileSearch },
  { action: "Matched with supervisor", subject: "Prof. Dr. Schmidt", time: "Yesterday", icon: GraduationCap },
  { action: "Profile updated", subject: "Research interests added", time: "3 days ago", icon: Users },
]

const progressPercent = Math.round(((student.stage - 1) / (stages.length - 1)) * 100)

function App() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="header items-center px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <img src={studyondLogo} alt="Studyond" className="h-6" />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <FileSearch className="size-4" />
            Topics
          </Button>
          <Button variant="ghost" size="sm">
            <GraduationCap className="size-4" />
            Supervisors
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <Avatar size="sm">
            <AvatarFallback>NB</AvatarFallback>
          </Avatar>
        </div>
      </header>

      {/* Main content */}
      <main className="scroll-area">
        <div className="scroll-area-content mx-auto max-w-5xl space-y-10">

          {/* Journey Hero */}
          <section className="space-y-6 pt-4">
            <div className="space-y-1">
              <h1 className="header-xl">Your Thesis Journey</h1>
              <p className="ds-body text-muted-foreground">
                Stage {student.stage} of {stages.length} · Topic & Supervisor Search
              </p>
            </div>

            {/* 5-stage stepper */}
            <div className="space-y-3">
              <div className="flex items-center gap-0">
                {stages.map((stage, i) => {
                  const isCompleted = stage.id < student.stage
                  const isActive = stage.id === student.stage
                  return (
                    <div key={stage.id} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <div
                          className={`flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                            isCompleted
                              ? "bg-primary text-primary-foreground"
                              : isActive
                              ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                              : "bg-secondary text-muted-foreground"
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="size-4" />
                          ) : (
                            <span className="ds-badge">{stage.id}</span>
                          )}
                        </div>
                        <span
                          className={`ds-caption text-center leading-tight ${
                            isActive ? "font-medium text-foreground" : "text-muted-foreground"
                          }`}
                          style={{ maxWidth: "72px" }}
                        >
                          {stage.label}
                        </span>
                      </div>
                      {i < stages.length - 1 && (
                        <div
                          className={`h-0.5 flex-1 mx-1 mb-4 rounded-full ${
                            stage.id < student.stage ? "bg-primary" : "bg-secondary"
                          }`}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="ds-caption text-muted-foreground">Overall progress</span>
                  <span className="ds-caption font-medium">{progressPercent}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Current Stage Card */}
          <section className="space-y-4">
            <h2 className="header-sm">Right now</h2>
            <Card className="shadow-none">
              <CardHeader>
                <CardTitle className="ds-title-cards">Topic & Supervisor Search</CardTitle>
                <CardDescription>
                  You're locking in your topic and supervisor — the most important decisions of your thesis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid-3-col">
                  {/* Browse Topics */}
                  <div className="group cursor-pointer rounded-xl border border-border p-4 transition-shadow duration-300 hover:shadow-lg">
                    <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-secondary">
                      <FileSearch className="size-4 text-muted-foreground" />
                    </div>
                    <p className="ds-title-cards mb-0.5">7,500+</p>
                    <p className="ds-caption text-muted-foreground mb-3">thesis topics available</p>
                    <Button size="sm" className="rounded-full w-full" variant="outline">
                      Browse Topics
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>

                  {/* Matched Supervisors */}
                  <div className="group cursor-pointer rounded-xl border border-border p-4 transition-shadow duration-300 hover:shadow-lg">
                    <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-secondary">
                      <GraduationCap className="size-4 text-muted-foreground" />
                    </div>
                    <p className="ds-title-cards mb-0.5">{matchedSupervisors.length} found</p>
                    <p className="ds-caption text-muted-foreground mb-3">supervisors matched</p>
                    <Button size="sm" className="rounded-full w-full" variant="outline">
                      View Matches
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>

                  {/* Company Partners */}
                  <div className="group cursor-pointer rounded-xl border border-border p-4 transition-shadow duration-300 hover:shadow-lg">
                    <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-secondary">
                      <Building2 className="size-4 text-muted-foreground" />
                    </div>
                    <p className="ds-title-cards mb-0.5">Open</p>
                    <p className="ds-caption text-muted-foreground mb-3">company partners available</p>
                    <Button size="sm" className="rounded-full w-full" variant="outline">
                      Explore Partners
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Matched Topics */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="header-sm">Your topic matches</h2>
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <div className="grid-3-col">
              {matchedTopics.map((topic) => (
                <Card
                  key={topic.title}
                  className="group cursor-pointer shadow-none transition-shadow duration-300 hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{topic.company}</Badge>
                      <Badge variant="outline">{topic.field}</Badge>
                    </div>
                    <CardTitle className="ds-label transition-colors duration-300 group-hover:text-primary">
                      {topic.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="rounded-full w-full">
                      Apply
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Two-column: Building Blocks + Recent Activity */}
          <section className="grid gap-6 lg:grid-cols-2">
            {/* Building Blocks Checklist */}
            <div className="space-y-4">
              <h2 className="header-sm">Thesis building blocks</h2>
              <Card className="shadow-none">
                <CardContent className="divide-y divide-border px-4 py-2">
                  {buildingBlocks.map((block, i) => {
                    const isDone = block.status === "done"
                    const isInProgress = block.status === "in-progress"
                    return (
                      <div key={i} className="flex items-center gap-3 py-3">
                        {isDone ? (
                          <CheckCircle2 className="size-4 flex-shrink-0 text-primary" />
                        ) : (
                          <Circle className="size-4 flex-shrink-0 text-muted-foreground/40" />
                        )}
                        <div className="flex-1">
                          <p className={`ds-label ${isDone ? "line-through text-muted-foreground" : ""}`}>
                            {block.label}
                          </p>
                        </div>
                        <Badge
                          variant={isDone ? "secondary" : isInProgress ? "default" : "outline"}
                          className="ds-badge flex-shrink-0"
                        >
                          {isInProgress ? block.note : block.status === "done" ? "Done" : "Open"}
                        </Badge>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="space-y-4">
              <h2 className="header-sm">Recent activity</h2>
              <Card className="shadow-none">
                <CardContent className="divide-y divide-border px-4 py-2">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="flex items-center gap-3 py-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-secondary flex-shrink-0">
                        <activity.icon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="ds-label">{activity.action}</p>
                        <p className="ds-caption text-muted-foreground">{activity.subject}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="ds-caption text-muted-foreground">{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* AI Thesis Assistant */}
          <section className="space-y-4 pb-8">
            <ThesisAIChat />
          </section>

        </div>
      </main>
    </div>
  )
}

export default App
