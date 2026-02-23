# CLAUDE.md

## Project Overview

<!-- TODO: Mô tả dự án tại đây -->

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Package Manager**: npm (hoặc cập nhật nếu dùng pnpm/yarn/bun)

## Project Structure

```
.
├── client/          # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── utils/
├── server/          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── utils/
└── CLAUDE.md
```

## Development Commands

```bash
# Frontend
cd client && npm run dev

# Backend
cd server && npm run dev

# Install dependencies
npm install
```

## Code Style & Conventions

- Dùng TypeScript strict mode
- Component: PascalCase (vd: `UserCard.tsx`)
- File utils/hooks: camelCase (vd: `useAuth.ts`)
- Tailwind class order: layout → spacing → typography → color → other
- Không dùng `any` trong TypeScript trừ khi thực sự cần thiết
- Prefer functional components và React hooks

## Key Notes for Claude

<!-- Ghi chú thêm cho Claude khi làm việc với dự án này -->
- Luôn dùng TypeScript, không dùng JavaScript thuần
- Styling bằng Tailwind CSS, không viết CSS file riêng trừ khi cần thiết
- API calls dùng fetch hoặc axios (cập nhật khi đã chọn)
