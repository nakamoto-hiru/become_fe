# CLAUDE.md

## Project Overview

**Become FE** — Internal competition, Cook Series.
Convert **Whales Market** Figma designs into a working React app.
Multiple pages, routing/navigation, functional FE logic, mock data rendered correctly. No backend needed.

## Scoring Criteria (Know Your Priorities)

| Criteria | Points | What judges look for |
|---|---|---|
| **AI Usage** | **30** | Depth of AI workflow, prompt quality, iteration process — not just the final result |
| **Pixel Accuracy & Logic** | **25** | Layout matches Figma, FE logic works, mock data renders correctly |
| **Completion & Enthusiasm** | **20** | How many pages done, % of scope covered |
| **Responsive & Interaction** | **15** | Mobile responsive, hover states, animations, transitions |
| **Presentation** | **10** | Clear demo, smooth walkthrough, confident Q&A |

**Total: 100 points.** AI usage is the highest weight — show the *process*, not just the output.

## Evaluation Levels

| Level | Description |
|---|---|
| **Minimum** | Multiple pages running, navigation works, layout roughly matches Figma, desktop view |
| **Good** | Pixel-accurate, FE logic (click, filter, toggle, modal), mock data correct, responsive mobile |
| **Excellent** | Complete flow like a real app, smooth animations/transitions, responsive, nearly production-ready |

## Build Strategy (IMPORTANT)

- Start with **ONE Anchor Page only**
- Anchor Page must be:
  - Fully styled to match Figma
  - Fully interactive (all buttons, states work)
  - Uses mock data
- Do NOT scaffold or polish other pages until the anchor page is complete and approved
- Anchor Page is considered complete only when:
  - Visuals match Figma
  - All interactions have visible state changes
  - No dead UI elements remain

Other pages can be simple placeholders at first.

## Interaction & State Priority

- Every interactive UI must define states:
  - default
  - hover / focus / active
  - loading
  - success
  - error (if applicable)

- No UI is considered "done" if it has no visible state change on interaction

## Mock Data & Fake Logic Rules

- Simulate loading delays (500–1200ms)
- Simulate failure cases when reasonable (e.g. random error 10–20%)
- Never return data instantly if the UI implies async behavior

## Claude Working Style

- Ask for clarification if Figma behavior is unclear
- Prefer simple, readable code over clever abstractions
- Prefer incremental improvement over visual perfection in early stages
- Optimize for easy iteration, not long-term architecture
- Do not over-engineer

## Design System — Figma-first

> **Highest priority: match Figma.** shadcn/ui is a base component layer, not the source of truth for styles.

### Styling principles

- **Never** use shadcn/ui default styles if they differ from Figma
- Override everything via `tailwind.config` and CSS variables in `globals.css`
- Spacing, border-radius, font-size, color — all taken from Figma, never assumed
- Always compare against Figma before marking a component done

### How to customize shadcn/ui to match Figma

1. **Colors**: Override CSS variables (`--primary`, `--background`, etc.) in `globals.css` using Figma color values
2. **Radius**: Set `--radius` to match Figma border-radius (do not keep the default `0.5rem`)
3. **Typography**: Override font-family, font-size, line-height, font-weight to match Figma type scale
4. **Spacing**: Add custom Tailwind spacing values if Figma uses a non-standard grid
5. **Component variants**: Add new variants instead of modifying defaults — easier to adjust later

### When to use shadcn/ui components

- Use shadcn/ui for: Button, Input, Select, Dialog/Modal, Tabs, Dropdown, Tooltip, Badge, Card...
- Always wrap shadcn components in a custom component for easier adjustment
- Example: don't use shadcn's `<Button>` directly throughout the codebase — create `components/Button.tsx` that wraps it with Figma-aligned props

## FE Logic Requirements

All interactions must work — no dead buttons:

- Navigation between pages (React Router)
- Modal/Dialog open and close
- Tab switch, filter, search, sort
- Toggle states
- Controlled form inputs
- Hover states, active states, focus states
- Animations and transitions (stretch goal — targets Excellent level)
- Responsive mobile layout (targets Good level)

## Quality Standards

- Zero console errors in browser
- No empty placeholders — all mock data must render
- No dead buttons or unresponsive UI elements

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) — used as base components only, **do not follow default styles**
- **Routing**: React Router DOM
- **Package Manager**: npm

## Project Structure

```
src/
├── pages/             # App pages (one folder or file per page)
├── components/        # Shared components
│   ├── ui/            # shadcn/ui components (auto-generated, do not edit directly)
│   └── ...            # Custom components wrapping shadcn/ui
├── mock-data/         # JSON mock data — no real API calls
├── hooks/             # Custom hooks
├── lib/               # Utilities (cn, helpers...)
└── App.tsx            # Routing setup
public/                # Static assets
ai-showcase/           # Screenshots of best AI prompts/conversations (for presentation)
README.md              # Project introduction
```

## Code Style & Conventions

- TypeScript strict mode, **no `any`**
- Components: PascalCase (`UserCard.tsx`)
- Utils/hooks: camelCase (`useAuth.ts`)
- Tailwind class order: layout → spacing → typography → color → other
- Prefer functional components + React hooks
- No separate CSS files — use Tailwind + CSS variables in `globals.css`
- Mock data in `src/mock-data/` as TypeScript files with full types

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
```

## Key Notes for Claude

- **Figma-first**: When implementing any component, get the Figma spec first. Never assume spacing/color/radius.
- **shadcn/ui = base, not final**: Install the shadcn component, then override styles to match Figma. Do not keep the default look.
- **Keep it adjustable**: Code must be easy to tweak. Use CSS variables for colors/spacing instead of hardcoding. Extract magic numbers into constants.
- **Typed mock data**: All mock data must have TypeScript interfaces/types. Place types in the same file or in `src/types/`.
- **No backend**: All data is mocked. Do not set up a server or use fetch/axios for real API calls.
- **Score-aware**: AI usage is 30pts — the highest weight. Always prefer demonstrable, iterative AI-assisted work.
- Always use TypeScript — no plain JavaScript.
