import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import {
  BookOpen,
  Sparkles,
  ArrowRight,
  Clock,
  TrendingUp,
  Target,
  Brain,
  FileText,
  CheckCircle,
  Plus,
} from "lucide-react"
import studyondLogo from "./assets/studyond.svg"

const recentCourses = [
  {
    title: "Linear Algebra",
    chapter: "Eigenvalues & Eigenvectors",
    progress: 72,
    lastStudied: "2h ago",
  },
  {
    title: "Organic Chemistry",
    chapter: "Nucleophilic Substitution",
    progress: 45,
    lastStudied: "Yesterday",
  },
  {
    title: "Machine Learning",
    chapter: "Gradient Descent",
    progress: 88,
    lastStudied: "3 days ago",
  },
]

const aiSuggestions = [
  { label: "Review weak topics in Linear Algebra", type: "review" },
  { label: "Practice problems for Organic Chemistry", type: "practice" },
  { label: "Summarize last ML lecture notes", type: "summarize" },
]

const recentActivity = [
  { action: "Completed quiz", subject: "Linear Algebra", time: "2h ago", icon: CheckCircle },
  { action: "Added notes", subject: "Organic Chemistry", time: "5h ago", icon: FileText },
  { action: "Started chapter", subject: "Machine Learning", time: "Yesterday", icon: BookOpen },
]

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
            <BookOpen className="size-4" />
            Library
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

          {/* Welcome */}
          <section className="space-y-1 pt-4">
            <h1 className="header-xl">Good evening, Nils</h1>
            <p className="ds-body text-muted-foreground">
              Pick up where you left off or let AI guide your next session.
            </p>
          </section>

          {/* Stats row */}
          <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Study streak", value: "12 days", icon: TrendingUp },
              { label: "Hours this week", value: "8.5h", icon: Clock },
              { label: "Topics mastered", value: "24", icon: Target },
              { label: "AI sessions", value: "7", icon: Brain },
            ].map((stat) => (
              <Card key={stat.label} className="py-4 shadow-none">
                <CardContent className="flex items-center gap-3 px-4">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-secondary">
                    <stat.icon className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="ds-title-cards">{stat.value}</p>
                    <p className="ds-caption text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Continue studying */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="header-sm">Continue studying</h2>
              <Button variant="ghost" size="sm">
                View all
                <ArrowRight className="size-4" />
              </Button>
            </div>
            <div className="grid-3-col">
              {recentCourses.map((course) => (
                <Card
                  key={course.title}
                  className="group cursor-pointer shadow-none transition-shadow duration-300 hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">{course.lastStudied}</Badge>
                    </div>
                    <CardTitle className="ds-title-cards transition-colors duration-300 group-hover:text-primary">
                      {course.title}
                    </CardTitle>
                    <CardDescription>{course.chapter}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="ds-caption text-muted-foreground">Progress</span>
                        <span className="ds-caption font-medium">{course.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-300"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* AI suggestions */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="size-4 text-muted-foreground" />
              <h2 className="header-sm">AI suggestions</h2>
            </div>
            <Card className="border-ai shadow-none">
              <CardContent className="space-y-3 px-4 py-4">
                {aiSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.label}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors duration-150 hover:bg-secondary"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex size-8 items-center justify-center rounded-md bg-secondary">
                        <Sparkles className="size-3.5 text-ai-solid" />
                      </div>
                      <span className="ds-label">{suggestion.label}</span>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Recent activity */}
          <section className="space-y-4">
            <h2 className="header-sm">Recent activity</h2>
            <Card className="shadow-none">
              <CardContent className="divide-y divide-border px-4 py-2">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <div className="flex size-8 items-center justify-center rounded-md bg-secondary">
                      <activity.icon className="size-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="ds-label">{activity.action}</p>
                      <p className="ds-caption text-muted-foreground">{activity.subject}</p>
                    </div>
                    <span className="ds-caption text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          {/* Quick actions */}
          <section className="flex flex-wrap gap-3 pb-8">
            <Button className="rounded-full" size="lg">
              <Plus className="size-4" />
              New study session
            </Button>
            <Button variant="outline" className="rounded-full" size="lg">
              <Brain className="size-4" />
              Ask AI
            </Button>
            <Button variant="outline" className="rounded-full" size="lg">
              <FileText className="size-4" />
              Upload notes
            </Button>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
