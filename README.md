# Studyond — AI-Powered Thesis Journey

> START Hack 2026 submission for the [Studyond](https://studyond.com) challenge

---

## The Case

Every thesis student goes through roughly the same 4–6 month process, but everyone arrives at a different point. Some have a topic but no supervisor. Some have both but need a company partner. Some are just beginning and don't know where to start. Today, students figure this out alone — Googling, emailing professors, piecing it together manually.

Studyond already has the building blocks: thousands of topics from 185+ companies, professors with published research interests, industry mentors, AI matching, and application management. The challenge: extend that platform from *"I'm starting my thesis"* all the way to *"I'm handing it in."*

---

## Our Solution

A **modular, AI-guided thesis journey** that meets students wherever they are and builds context over time. Six phases cover the full arc — from anxious first steps to final submission — with intelligent support at every stage.

The system respects three core principles:

- **Modular Entry** — Students start at any phase based on where they actually are
- **Context Accumulation** — Every interaction builds a richer understanding of the student's goals
- **Academic Governance** — AI suggests and supports, but academic decisions stay with the professor

---

## The 6-Phase Journey

| # | Phase | What happens |
|---|-------|-------------|
| 1 | **Browse** | Explore the topic landscape via an interactive graph. Discover supervisors, companies, and thesis topics. Bookmark and compare. |
| 2 | **Select** | Narrow down to a shortlist. Compare topics side-by-side. Prioritize your bookmarks. |
| 3 | **Research** | Plan your methodology with an AI-assisted outline editor. Structure chapters, define scope, get instant feedback. |
| 4 | **Thesis Companion** | Checklists, formatting guidance, and progress tracking through the writing phase. |
| 5 | **Submit** | Reviews, revisions, and submission management. |
| 6 | **Publish** | Archive your thesis, get it showcased to future students and employers. |

---

## Key Features

### Interactive Topic Graph
A circular, force-directed visualization of the thesis landscape. Three concentric rings show research fields, universities and companies, and individual thesis topics. Explore hundreds of real topics from 50+ Swiss and international companies.

### AI Onboarding
Students select their university and study programme, and Claude instantly suggests the most relevant research fields based on their academic context.

### Research Outline Editor
A ReactFlow canvas powered by Claude Opus 4.6. The AI can create sub-projects, add and edit nodes, and suggest structure — while the student remains in control. Streaming responses keep the interaction feeling live.

### Expert Booking
Book 1:1 sessions with industry experts. Calendar-based availability, time slot selection, and booking confirmation built in.

### Search & Compare
Full-text search with filters for field, degree level, and employment type. Side-by-side topic comparison to help students make confident decisions.

### AI Chat Assistant
A persistent sidebar assistant that understands the student's current phase, selected topics, and goals — providing contextual guidance throughout the journey.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Routing | React Router 7 |
| Styling | TailwindCSS 4, shadcn/ui |
| Animation | Framer Motion |
| State | Zustand |
| Graph | XYFlow/React, elkjs |
| AI | Anthropic Claude (Haiku + Opus 4.6) via Vercel AI SDK |
| Deployment | Cloudflare Workers |

---

## Getting Started

```bash
bun install
bun run dev
```

For deployment:

```bash
bun run build
wrangler deploy
```

Set `ANTHROPIC_API_KEY` in your Cloudflare Worker environment for AI features.

---

## Data

The prototype runs on realistic mock data:

- 400+ thesis topics from 50+ companies (Nestlé, Roche, UBS, and more)
- 185+ supervisors across Swiss universities
- Multiple degree levels (BSc, MSc, PhD)
- Industry experts available for mentoring sessions

---

## Design Philosophy

The interface follows *editorial minimalism* — clean, structured, and intentional. The visual language distinguishes academic (university/professor) from industry (company/expert) contexts throughout. The emotional arc matters: the product is designed to reduce student anxiety, not just surface information.

---

## Team

Built at START Hack 2026 in 36 hours.
