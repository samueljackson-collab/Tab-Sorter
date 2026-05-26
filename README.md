<div align="center">
<img width="1200" height="475" alt="Tab Sorter AI Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />

# Tab Sorter AI

**Intelligent browser tab organizer powered by Google Gemini AI**

[![CI](https://github.com/samueljackson-collab/tab-sorter/actions/workflows/ci.yml/badge.svg)](https://github.com/samueljackson-collab/tab-sorter/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)

</div>

---

## Overview

Tab Sorter AI is a web application that helps you organize, manage, and clean up your browser tabs. It combines drag-and-drop organization with AI-powered grouping suggestions from Google Gemini to reduce tab clutter and save memory.

## Features

- **AI-Powered Sorting** — Gemini AI analyzes your tabs and suggests intelligent groupings based on content and context
- **Drag & Drop** — Reorder tabs and groups with smooth drag-and-drop interactions
- **Folder System** — Organize tab groups into folders with custom colors, icons, and categories
- **Smart Detection** — Automatically identifies duplicate and broken tabs
- **Memory Saving Mode** — Auto-closes inactive tabs after a configurable threshold
- **Session Saving** — Save your current tabs at end-of-day and restore them later
- **Auto-Tagging** — AI generates descriptive tags for each tab group
- **Batch Operations** — Select multiple tabs or folders for bulk actions
- **Dark Mode** — Full dark mode support with customizable theme colors
- **Sharing** — Generate shareable links for folders

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5.8 |
| Build Tool | Vite 6.2 |
| Styling | Tailwind CSS 4.1 |
| AI | Google Gemini (`@google/genai`) |
| Drag & Drop | `@dnd-kit/core` + `@dnd-kit/sortable` |
| Animations | Motion |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |

## Prerequisites

- **Node.js** 18 or later ([download](https://nodejs.org/))
- **npm** 9 or later (bundled with Node.js)
- **Gemini API key** — [get one free at Google AI Studio](https://aistudio.google.com/app/apikey)

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/samueljackson-collab/tab-sorter.git
cd tab-sorter

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# 4. Start the development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

For a detailed step-by-step guide including troubleshooting, see [INSTALL.md](INSTALL.md).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Your Google Gemini API key. Get one at [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `APP_URL` | No | Hosting URL. Auto-injected by Google AI Studio when deployed. |

Create `.env.local` in the project root (this file is gitignored):

```env
GEMINI_API_KEY=your_api_key_here
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server at `http://localhost:3000` |
| `npm run build` | Build for production (outputs to `dist/`) |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint + TypeScript checks |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run clean` | Remove `dist/` directory |

## Production Build

```bash
# Build the app
npm run build

# Preview locally before deploying
npm run preview
# Opens at http://localhost:4173
```

The production build outputs to `dist/`. It's a standard Vite/React SPA — deploy to any static hosting service (Vercel, Netlify, Cloudflare Pages) or Google AI Studio.

## Deploy to Google AI Studio

1. Push your changes to GitHub
2. Open [AI Studio](https://aistudio.google.com/) and connect your repository
3. Add `GEMINI_API_KEY` to the Secrets panel
4. Deploy — AI Studio injects the key and `APP_URL` automatically

Or use the existing deployment: [ai.studio/apps/46c114d7-b7ce-45ff-9509-979fd7500db8](https://ai.studio/apps/46c114d7-b7ce-45ff-9509-979fd7500db8)

## License

Apache 2.0 — see individual source files for SPDX headers.
