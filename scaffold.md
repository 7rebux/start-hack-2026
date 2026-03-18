
description: Scaffold a new Studyond-branded React + TypeScript project with Tailwind, shadcn/ui, and the full design system pre-configured. Only relevant if your team chose the React/Vite/Tailwind/shadcn stack from the brand guide.

## Instructions

```bash
bun install tailwindcss @tailwindcss/vite
bun install ai @ai-sdk/anthropic
bun install zustand
bun install lucide-react
bun install framer-motion
bunx shadcn@latest init
```

3. When shadcn prompts for options, choose:
   - Style: **New York**
   - Base color: **Zinc**
   - CSS variables: **Yes**

4. Copy the shadcn config from the brand guide:
   - Read `brand/components.json` and write it to `components.json`

5. Install recommended shadcn components:

```bash
bunx shadcn@latest add button card input dialog badge tabs
bunx shadcn@latest add form select textarea tooltip avatar
bunx shadcn@latest add sidebar sheet dropdown-menu separator
```

6. Copy the full design system CSS:
   - Read `brand/app.css` and write it to `src/App.css`

7. Copy the logo:
   - Copy `brand/studyond.svg` to `src/assets/studyond.svg`

8. Confirm the setup is complete and suggest next steps:
   - Review `brand/components.md` for layout patterns and component guidelines
   - Review `brand/README.md` for do's and don'ts
   - Run `bun run dev` to start developing
