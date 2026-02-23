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

| Page | Route | Status |
|---|---|---|
| — | — | — |

> Pages will be updated as the build progresses.

---

## AI Showcase

Screenshots and conversation links of notable AI-assisted workflows are collected in [`/ai-showcase`](./ai-showcase/).

Highlights include:
- Initial project setup prompt
- Figma → component conversion workflow
- Iterative feedback loops with AI

---

## Figma Reference

Design source: **Whales Market** (internal Figma file)

> Place Figma side-by-side with the browser during review for pixel accuracy comparison.

---

*Built for Become FE · Cook Series · 2026*
