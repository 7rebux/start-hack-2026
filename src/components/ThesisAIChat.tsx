import { useState, useRef, useEffect } from "react"
import Anthropic from "@anthropic-ai/sdk"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Send } from "lucide-react"

const client = new Anthropic({
  apiKey: 'not-needed',
  baseURL: `${window.location.origin}/api/ai`,
  dangerouslyAllowBrowser: true,
})

const SYSTEM_PROMPT = `You are the Studyond AI Thesis Assistant — an expert guide for students navigating their thesis journey.

Student profile:
- Name: Nils
- University: ETH Zürich
- Current stage: Stage 2 of 5 — Topic & Supervisor Search
- Interests: Machine Learning, AI, Data Science
- Target: Master's thesis in Computer Science

Studyond is a three-sided marketplace connecting students, companies, and universities for thesis collaboration.

The 5 thesis stages are:
1. Orientation — Understanding what a thesis involves
2. Topic & Supervisor Search — Finding a topic and supervisor (Nils is here)
3. Planning — Structuring the thesis timeline and methodology
4. Execution — Conducting research, data collection, and analysis
5. Writing — Writing, revising, and submitting

Thesis building blocks Nils needs to complete:
- Finding a Topic (in progress — 3 matches: Roche, UBS, McKinsey)
- Finding a Supervisor (2 matched: Prof. Dr. Birte Glimm, Prof. Dr. Ce Zhang)
- Company Partner (open)
- Interview Partners (open)
- Data Access (open)
- Methodology (open)
- Timeline & Milestones (open)
- Literature (open)
- Mentor & Feedback (open)

Be concise, encouraging, and practical. Help Nils make progress on his thesis today.`

interface Message {
  role: "user" | "assistant"
  content: string
}

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "Hi Nils, you're in Stage 2 — Topic & Supervisor Search. What would you like to work on today?",
}

export function ThesisAIChat() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage() {
    const text = input.trim()
    if (!text || loading) return

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
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
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
              content: updated[updated.length - 1].content + (event.delta as { type: string; text: string }).text,
            }
            return updated
          })
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, something went wrong. Please check your API key and try again.",
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

  return (
    <Card className="border-ai shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 header-sm">
          <Sparkles className="size-4 text-ai-solid" />
          AI Thesis Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        {/* Chat thread */}
        <div className="max-h-72 space-y-3 overflow-y-auto">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="mr-2 mt-0.5 flex size-6 flex-shrink-0 items-center justify-center rounded-md bg-secondary">
                  <Sparkles className="size-3.5 text-ai-solid" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 ds-small ${
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
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about topics, supervisors, methodology…"
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
      </CardContent>
    </Card>
  )
}
