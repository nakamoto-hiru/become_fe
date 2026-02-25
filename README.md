# Become FE — Whales Market

> **Become FE** · Internal Competition · Cook Series
> Converting Whales Market Figma designs into a fully functional React app.

---

## Overview

A pixel-accurate React implementation of the **Whales Market** UI — built as part of the Become FE internal competition. The goal: turn Figma designs into a working, interactive web app using AI tooling.

- Multiple pages with client-side routing
- Functional FE logic (filter, search, sort, modal, tabs)
- Mock data throughout — no backend required
- Responsive layout (desktop + mobile)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React + TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui (customized to match Figma) |
| Routing | React Router DOM |
| Package Manager | npm |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Project Structure

```
src/
├── pages/          # One folder/file per page
├── components/
│   ├── ui/         # shadcn/ui base components (do not edit directly)
│   └── ...         # Custom components wrapping shadcn/ui
├── mock-data/      # TypeScript mock data files
├── hooks/          # Custom React hooks
├── lib/            # Utilities (cn, helpers)
└── App.tsx         # Route definitions
public/             # Static assets
ai-showcase/        # AI prompt screenshots used during build
```

---

## Pages

| Page | Route | Status | Description |
|---|---|---|---|
| Home | `/` | Done | Market listing dashboard — top metrics bar (24h vol, Fear & Greed animated gauge, Altcoin season index, countdown timer), Live/Upcoming/Ended market tabs with badge counts, sortable token table with sparkline SVG charts, recent activities feed with live trade simulation (slide-in animation, relative time), bottom stats bar with radar-pulse LIVE DATA indicator |
| Premarket Landing | `/premarket` | Done | Anchor page — hero section with CTA + decorative trade panel + video modal, slot-machine stats animation, live/upcoming market tables with real-time price simulation, how-to-join buy/sell steps with video background, 7-item FAQ accordion, footer |
| Market Detail | `/premarket/:slug` | Placeholder | Under Development page with whale mascot + CTA back to Premarket |
| Dashboard | `/dashboard` | Placeholder | Under Development |
| Earn | `/earn` | Placeholder | Under Development |
| Resources | `/resources` | Placeholder | Under Development |
| AI Showcase | `/ai-showcase` | Done | *(Demo-only, outside product scope)* — Gallery of AI workflow screenshots with lightbox viewer, keyboard navigation, responsive grid |
| Under Development | various | Done | *(Demo-only, outside product scope)* — Shared placeholder page with animated whale mascot, shown for routes not yet implemented |

### Completed Features

- **Navbar** — Sticky with glassmorphism on scroll, 4 dropdowns (Chain, Language, Earn, Resources), wallet connect modal with 6 networks x 5 wallets, user menu, hamburger mobile drawer
- **Real-time Simulation** — Price random-walk, volume ticks, watcher count updates via custom hooks (`useSimulatedStats`, `useSimulatedMarkets`, `useSimulatedHomeMarkets`); live trade generator in RecentActivities with weighted random intervals
- **i18n** — 15 languages fully translated (EN, VI, ZH-CN, ZH-TW, ES, RU, FR, DE, JA, KO, PT, TR, ID, TH, AR)
- **Design System** — 100+ CSS tokens, full typography scale (display-lg to body-xs), semantic color tokens
- **Responsive** — Mobile/tablet/desktop breakpoints for all Premarket sections + Navbar hamburger menu
- **Animations** — Slot-machine digit reels, coin float keyframes, page transitions, accordion grid-rows, flash green/red on value changes, skeleton shimmer, recent trade slide-in (grid 0fr→1fr), radar pulse LIVE DATA icon

---

## AI Showcase

Screenshots and conversation links of notable AI-assisted workflows are collected in [`/ai-showcase`](./ai-showcase/).

Highlights include:
- Initial project setup prompt
- Figma → component conversion workflow
- Iterative feedback loops with AI

---

## Competition Schedule

| Day | Focus | Deliverable |
|---|---|---|
| Day 1 | Setup environment + GitHub + AI tools | Project runs + repo created + link shared |
| Day 2 | Build pages + routing + mock data | Main pages running + push to GitHub |
| Day 3 | Polish + FE logic + responsive + prep demo | App functional + final push to GitHub |
| Day 4 | **Presentation + Q&A** | Live demo to judges |

---

## Figma Reference

Design source: **Whales Market** (internal Figma file)

> Place Figma side-by-side with the browser during review for pixel accuracy comparison.

---

*Built for Become FE · Cook Series · 2026*
