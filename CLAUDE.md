# CLAUDE.md

## Project Overview

**Become FE** — Internal competition, Cook Series.
Convert **Whales Market** Figma designs into a working React app.
Multiple pages, routing/navigation, functional FE logic, mock data rendered correctly. No backend needed.

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
```

## Development Commands

```bash
npm run dev      # Start dev server
npm run build    # Production build
```

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

## Code Style & Conventions

- TypeScript strict mode, **no `any`**
- Components: PascalCase (`UserCard.tsx`)
- Utils/hooks: camelCase (`useAuth.ts`)
- Tailwind class order: layout → spacing → typography → color → other
- Prefer functional components + React hooks
- No separate CSS files — use Tailwind + CSS variables in `globals.css`
- Mock data in `src/mock-data/` as TypeScript files with full types

## FE Logic Requirements

All interactions must work — no dead buttons:

- Navigation between pages (React Router)
- Modal/Dialog open and close
- Tab switch, filter, search
- Toggle states
- Controlled form inputs
- Hover states, active states, focus states

## Key Notes for Claude

- **Figma-first**: When implementing any component, get the Figma spec first. Never assume spacing/color/radius.
- **shadcn/ui = base, not final**: Install the shadcn component, then override styles to match Figma. Do not keep the default look.
- **Keep it adjustable**: Code must be easy to tweak. Use CSS variables for colors/spacing instead of hardcoding. Extract magic numbers into constants.
- **Typed mock data**: All mock data must have TypeScript interfaces/types. Place types in the same file or in `src/types/`.
- **No backend**: All data is mocked. Do not set up a server or use fetch/axios for real API calls.
- Always use TypeScript — no plain JavaScript.
