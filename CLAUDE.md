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

## Figma Reading Rules — MANDATORY
- NEVER use screenshots to extract design values
- ALWAYS use get_design_context or get_variable_defs MCP calls
- Before building ANY component, print extracted values first
- If MCP call fails, ask user for the node-id — do NOT fallback to screenshot

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

### Token & Tailwind Usage Rules — MANDATORY

**Spacing** — NEVER use `p-[Npx]` / `gap-[Npx]` / `m-[Npx]` when a Tailwind class exists:
  2px→0.5 · 4px→1 · 6px→1.5 · 8px→2 · 10px→2.5 · 12px→3 · 14px→3.5 · 16px→4
  20px→5 · 24px→6 · 28px→7 · 32px→8 · 48px→12 · 56px→14 · 60px→15 · 64px→16
  Special: 1px→px · negative -4px → -1

**Colors** — NEVER use raw `#hex` or `rgba()` when a token exists:
  #f9f9fa → text-wm-text-01 / bg-wm-bg-inv
  #0a0a0b → bg-wm-bg-01 / text-wm-text-inv / border-wm-bg-01
  #7a7a83 → text-wm-text-03
  rgba(255,255,255,0.05) → bg-wm-overlay-5 (or `var(--wm-overlay-5)` in inline styles)
  rgba(22,194,132,0.20) → bg-wm-bg-primary-20 (or `var(--wm-bg-primary-muted-20)` in inline ternary)

**Typography** — NEVER use `text-[Npx] leading-[Npx]` when a utility exists:
  12/16 Medium → text-label-xs · 12/16 Regular → text-body-xs
  14/20 Medium → text-label-sm · 14/20 Regular → text-body-sm
  16/24 Medium → text-label-md · 18/28 → text-label-lg / text-body-lg

**Inline styles** — NEVER put padding/margin in `style={{}}`, always use Tailwind classes.
  Exception: dynamic `style` for conditional colors (ternary) is OK, but values must use `var(--wm-*)` not raw hex.

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
```

## Key Notes for Claude

- **Figma-first**: Get Figma spec via MCP before implementing anything. Never assume spacing/color/radius.
- **No screenshots**: Always use `get_design_context` — never rely on visual estimation from screenshots.
- **Tailwind v4**: No `tailwind.config.ts`. All tokens in `@theme` block in `globals.css`.
- **No arbitrary values**: If a token doesn't exist, add it to `globals.css` first.
- **shadcn/ui = base, not final**: Override all styles to match Figma.
- **Keep it adjustable**: Use CSS variables for colors/spacing. Extract magic numbers into tokens.
- **Typed mock data**: All mock data must have TypeScript interfaces. Place in `src/mock-data/`.
- **No backend**: All data is mocked. No fetch/axios for real API calls.
- **Score-aware**: AI usage is 30pts. Always prefer demonstrable, iterative workflow over one-shot generation.
- Always use TypeScript — no plain JavaScript.

---

## Current Status (updated 2026-02-25)

### ✅ Completed — Anchor Page (PremarketPage `/`)
6 sections fully built, animated, interactive:
1. **HeroSection** — headline + CTA + decorative coins/trade panel + play button → video modal (uses `createPortal` to escape `page-fade-in` transform)
2. **StatsSection** — slot-machine digit reel animation (IntersectionObserver trigger) + real-time simulation via `useSimulatedStats` hook (re-triggers animation on value change with `key={raw}`)
3. **MarketTodaySection** — Live + Upcoming market tables + real-time price/volume simulation via `useSimulatedMarkets` hook + flash green/red `AnimatedValue` component on change
4. **HowToJoinSection** — Buy/Sell tab toggle with sliding panels (translateX) + step cards with glassmorphism + arrow connectors + video background (`/assets/howtojoin-bg.mp4`, `object-bottom`)
5. **FaqSection** — 7-item accordion with `grid-template-rows` animation
6. **Footer** — 4 link columns + brand

### ✅ Completed — Global Components
- **Navbar** (639 lines) — sticky, glassmorphism on scroll (inline styles for backdrop-blur due to Tailwind v4 JIT issue), 4 dropdowns (Chain, Language, Earn, Resources), wallet connect modal, user menu
- **ConnectWalletModal** — 6 networks × 5 wallets, tab switching
- **Button** (356 lines) — 4 variants × 5 appearances × 4 sizes, loading state
- **Input** — 2 variants × 2 sizes, error state, icons
- **Checkbox** — custom styled, indeterminate support
- **Toast** — 6 types, auto-dismiss, action buttons
- **i18n** — LanguageContext with 5 languages, all sections translated

### ✅ Completed — Design System
- ~100+ CSS tokens in `src/index.css` (`@theme` block)
- Typography scale: display-lg → body-xs
- Color tokens: `--wm-bg-*`, `--wm-text-*`, `--wm-border-*`, `--wm-overlay-*`
- Zero `any` types, zero console errors

### ✅ Completed — Real-time Data Simulation
- `src/hooks/useSimulatedStats.ts` — stats nudge every 6-9s
- `src/hooks/useSimulatedMarkets.ts` — price random-walk ±0.5-2%, volume +20-350/tick every 4-6s, watchers +1-15 every 10-15s

### ⚠️ Known Technical Issues
- **`page-fade-in` breaks `position: fixed`**: The CSS animation in `AppLayout.tsx > PageTransition` creates `transform: matrix(1,0,0,1,0,0)` which breaks fixed positioning for all descendants. Any modal rendered inside page content MUST use `createPortal(jsx, document.body)`. VideoModal already fixed.
- **Tailwind v4 JIT + dynamic classes**: Arbitrary classes like `backdrop-blur-[16px]` in conditional expressions may not generate CSS. Use inline `style={{}}` as workaround.
- **Preview tool dark screenshots**: JPEG compression makes dark UI appear all-black. Use Chrome browser or `preview_eval`/`preview_inspect` for verification.

### 🔴 TODO — Day 4 Priority
1. **Responsive mobile** — add breakpoints to: Navbar (hamburger menu), HeroSection (stack vertical), StatsSection (2×2 grid), MarketTodaySection (horizontal scroll or card layout), HowToJoinSection (stack cards vertical), FaqSection, Footer
2. **Add 1 strategic page** — Dashboard or Market Detail page with real content (not placeholder). This satisfies the "multiple pages" Minimum requirement.
3. **Presentation prep** — AI Showcase already has 8 annotated screenshots in `ai-showcase/`
