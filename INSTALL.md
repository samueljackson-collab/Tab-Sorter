# Installation & Testing Guide

This guide covers everything you need to install, configure, and personally test Tab Sorter AI before a production release.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Get a Gemini API Key](#2-get-a-gemini-api-key)
3. [Clone & Install](#3-clone--install)
4. [Configure Environment](#4-configure-environment)
5. [Run Locally](#5-run-locally)
6. [Manual Testing Checklist](#6-manual-testing-checklist)
7. [Automated Tests](#7-automated-tests)
8. [Production Build Test](#8-production-build-test)
9. [Code Quality Checks](#9-code-quality-checks)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Prerequisites

Verify these are installed before continuing:

```bash
node --version   # Must be 18.0.0 or later
npm --version    # Must be 9.0.0 or later
git --version    # Any recent version
```

Download Node.js (includes npm) from [nodejs.org](https://nodejs.org/) if needed. The LTS version is recommended.

---

## 2. Get a Gemini API Key

The AI sorting features require a Google Gemini API key. The free tier is sufficient for personal testing.

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API key**
4. Select an existing Google Cloud project, or create a new one
5. Copy the generated key — you'll use it in the next section

Keep your API key private. It is loaded from a local `.env.local` file that is gitignored and never committed.

---

## 3. Clone & Install

```bash
# Clone the repository
git clone https://github.com/samueljackson-collab/tab-sorter.git
cd tab-sorter

# Install all dependencies
npm install
```

Expected output: `added N packages, and audited N packages in Xs`

---

## 4. Configure Environment

The app needs a `.env.local` file in the project root. This file is gitignored and never committed.

```bash
# Copy the template
cp .env.example .env.local
```

Open `.env.local` in any editor and fill in your values:

```env
# Required: Your Google Gemini API key
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional: Only needed for OAuth callbacks or self-referential links
# APP_URL=http://localhost:3000
```

**Note:** `APP_URL` is automatically injected by Google AI Studio when deployed to production. For local testing you can leave it unset or set it to `http://localhost:3000`.

---

## 5. Run Locally

```bash
npm run dev
```

You should see:

```
  VITE v6.x.x  ready in Xms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app loads with mock tab data pre-populated so you can explore all features immediately.

---

## 6. Manual Testing Checklist

Work through each section below. The app uses mock data — no real browser tabs are needed.

### 6.1 Initial Load

- [ ] App loads without a blank white screen
- [ ] Mock tabs are displayed in groups
- [ ] No red error banners in the browser console (`F12 → Console`)
- [ ] The top navigation bar renders correctly

### 6.2 Tab Management

- [ ] Click a tab item — it highlights/selects
- [ ] Click the **close (X)** button on a tab — it disappears from the group
- [ ] Click the **pin** icon on a tab — the tab is marked as pinned
- [ ] Click the **duplicate** badge on a tab marked as duplicate — verify it's visible
- [ ] Select multiple tabs using the checkbox area — a floating action bar appears at the bottom

### 6.3 Group Operations

- [ ] Click **+ New Group** (or equivalent button) — a new empty group is created
- [ ] Double-click a group name — it becomes editable; type a new name and press Enter
- [ ] Click the **color dot** on a group — a color picker appears; select a color
- [ ] Drag a tab from one group to another — it moves correctly
- [ ] Click **Delete Group** — a confirmation dialog appears before deleting

### 6.4 Folder System

- [ ] Click **+ New Folder** — a new folder is created
- [ ] Drag a tab group into a folder — the group appears inside the folder
- [ ] Click the folder name — it expands/collapses
- [ ] Right-click or use the folder menu — options appear (rename, delete, share)
- [ ] Click **Share** on a folder — a share link is generated and displayed

### 6.5 AI Features (requires valid GEMINI_API_KEY)

- [ ] Click **AI Sort** or the AI sorting button — the `AISorterModal` opens
- [ ] Type a sorting preference (e.g., "group by topic") and click **Sort**
- [ ] Wait for the AI response — tabs rearrange into AI-suggested groups
- [ ] Click **Generate Tags** on a group — tags appear below the group name
- [ ] Open the AI Group Suggester for an individual tab — a suggested group appears

**Without a valid API key:** The AI features should show an error or gracefully fall back without crashing the app.

### 6.6 Settings Panel

- [ ] Click the **Settings** (gear) icon — the settings panel slides open
- [ ] Toggle **Dark Mode** — the entire UI switches to dark theme
- [ ] Adjust **Inactive Threshold** slider — the value updates
- [ ] Change **Auto Save** setting — the selection persists
- [ ] Toggle **Memory Saving Mode** — the toggle responds
- [ ] Close settings — the panel closes and settings are retained

### 6.7 End-of-Day / Session Saving

- [ ] Click the **End of Day** or save session button — the `EndOfDayModal` opens
- [ ] Confirm saving — a saved session entry appears in the sessions list
- [ ] Click **Restore** on a saved session — tabs are restored

### 6.8 Search & Filtering

- [ ] Use the search box (if visible) — tab groups or folders filter in real-time
- [ ] Clear the search — all items reappear

### 6.9 Responsive Layout

- [ ] Resize the browser window to ~400×600px (browser extension size) — layout remains usable
- [ ] Resize back to full screen — layout scales correctly

---

## 7. Automated Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (re-runs on file save)
npm run test:watch

# Run with coverage report
npm run test:coverage
```

Expected output:

```
 ✓ src/__tests__/types.test.ts (8 tests)
 ✓ src/__tests__/geminiService.test.ts (10 tests)

 Test Files  2 passed (2)
      Tests  18 passed (18)
```

All tests must pass before a production release.

---

## 8. Production Build Test

```bash
# Build the production bundle
npm run build
```

Expected output:
```
vite v6.x.x building for production...
✓ built in Xs
dist/index.html    X kB
dist/assets/...
```

Then verify the production build runs correctly:

```bash
npm run preview
# Opens at http://localhost:4173
```

Check the same items in the [Manual Testing Checklist](#6-manual-testing-checklist) using the preview server. The production build should behave identically to the dev server.

---

## 9. Code Quality Checks

Run all quality checks before tagging a release:

```bash
# TypeScript type checking
npm run typecheck

# ESLint + TypeScript (all must pass with 0 errors)
npm run lint

# Prettier formatting check
npm run format:check

# If formatting issues are found, auto-fix with:
npm run format
```

All four commands must exit with code `0` for a clean release.

---

## 10. Troubleshooting

### Blank white page on load

1. Open browser DevTools (`F12`) and check the Console tab for errors
2. Verify `npm install` completed without errors
3. Check that `.env.local` exists and has `GEMINI_API_KEY=` set (even a dummy value for non-AI testing)

### Port 3000 already in use

```bash
# Use a different port
npx vite --port 3001
```

Or kill the process using port 3000:

```bash
# Find and kill the process (Linux/macOS)
lsof -ti:3000 | xargs kill
```

### AI features not working / API errors

- Open DevTools Console and look for `GEMINI_API_KEY is not set` or `403` errors
- Verify your `.env.local` has the correct `GEMINI_API_KEY` value (no extra spaces or quotes)
- Confirm the API key is active at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- The free tier has rate limits — wait a moment and retry if you see `429 Too Many Requests`

### `npm install` fails

```bash
# Clear cache and retry
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### TypeScript / lint errors after pulling new code

```bash
# Re-install dependencies in case new packages were added
npm install

# Then re-run lint
npm run lint
```

### Tests fail with `Cannot find module`

```bash
# Ensure all dependencies are installed
npm install

# Then run tests again
npm test
```
