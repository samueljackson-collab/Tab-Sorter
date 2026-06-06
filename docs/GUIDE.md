# Tab Sorter AI — Comprehensive Guide

## Table of Contents

1. [Overview](#1-overview)
2. [Prerequisites](#2-prerequisites)
3. [Installation](#3-installation)
4. [Gemini API Key Setup](#4-gemini-api-key-setup)
5. [Usage](#5-usage)
   - [Drag-and-Drop Reordering](#51-drag-and-drop-reordering)
   - [AI Grouping Suggestions](#52-ai-grouping-suggestions)
   - [Folder System](#53-folder-system)
   - [Duplicate Detection](#54-duplicate-detection)
   - [Memory-Saving Mode](#55-memory-saving-mode)
   - [Session Save and Restore](#56-session-save-and-restore)
   - [Auto-Tagging](#57-auto-tagging)
   - [Batch Operations](#58-batch-operations)
   - [Dark Mode](#59-dark-mode)
6. [Testing](#6-testing)
7. [Production Build and Serving](#7-production-build-and-serving)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. Overview

**Tab Sorter AI** is an AI-powered browser tab organizer built as a standalone React web application. It is **not** a browser extension — it is a full SPA (Single-Page Application) that simulates browser tab management using realistic mock tab data. This means you can explore every feature without installing anything into your browser.

The app combines manual drag-and-drop organization with Google Gemini AI to help you reduce tab clutter, identify duplicates, save memory, and restore work sessions. All state is managed client-side; an optional Express + SQLite backend handles session persistence across page reloads.

**Key capabilities at a glance:**

- AI-powered tab grouping via Google Gemini (`gemini-2.5-flash`)
- Drag-and-drop reordering of tabs and groups using `@dnd-kit`
- Folder system with custom colors and icons
- Automatic duplicate and broken-tab detection
- Memory-saving mode that suspends inactive tabs
- End-of-day session saving and one-click restoration
- AI auto-tagging of tab groups
- Batch operations on multiple tabs
- Full dark mode with customizable theme

---

## 2. Prerequisites

Before installing, confirm the following are available on your machine:

| Requirement | Minimum Version | Check Command |
|-------------|----------------|---------------|
| Node.js | 20.0.0 or later | `node --version` |
| npm | 9.0.0 or later | `npm --version` |
| Git | Any recent version | `git --version` |

Download Node.js (which bundles npm) from [nodejs.org](https://nodejs.org/). The LTS release is recommended.

You also need a **Google Gemini API key** — see [Section 4](#4-gemini-api-key-setup).

---

## 3. Installation

### Step 1 — Clone the repository

```bash
git clone https://github.com/samueljackson-collab/tab-sorter.git
cd tab-sorter
```

### Step 2 — Install dependencies

```bash
npm ci
```

`npm ci` installs exactly the versions recorded in `package-lock.json`, giving a reproducible install. If `package-lock.json` is absent (fresh checkout on some forks), use `npm install` instead.

### Step 3 — Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Gemini API key:

```env
# Required — your Google Gemini API key
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Optional — only needed for OAuth callbacks or self-referential links
# APP_URL=http://localhost:3000
```

The `.env.local` file is listed in `.gitignore` and is never committed to version control.

### Step 4 — Start the development server

```bash
npm run dev
```

You should see output similar to:

```
  VITE v6.x.x  ready in Xms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The app loads with mock tab data pre-populated so you can immediately explore all features.

### Optional — Using the automated install scripts

Platform-specific scripts are provided for convenience:

| Platform | Script |
|----------|--------|
| Linux / macOS | `bash install.sh` |
| Windows (Command Prompt) | `install.bat` |
| Windows (PowerShell) | `.\install.ps1` |

Each script checks your Node.js version, copies `.env.example` to `.env`, installs dependencies, and runs the test suite.

---

## 4. Gemini API Key Setup

### Getting a key

1. Go to [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
2. Sign in with a Google account
3. Click **Create API key**
4. Select an existing Google Cloud project or create a new one
5. Copy the generated key

The free tier is sufficient for development and personal use.

### Where to enter it

There are two ways to supply the key:

**Option A — `.env.local` file (recommended for local development)**

Add `GEMINI_API_KEY=your_key_here` to `.env.local` in the project root. Vite reads this at build time and injects the value into the bundle.

**Option B — Settings panel in the UI**

If no key is baked into the build, the app falls back to reading a key entered directly in the **Settings panel**:

1. Click the gear icon in the top-right corner of the app
2. Scroll to the **AI Configuration** section
3. Paste your Gemini API key into the **API Key** field
4. The key is stored in the browser's `localStorage` under `geminiApiKey` and persists across reloads

> **Security note:** Your API key is never sent to any server controlled by this app. It goes directly from your browser to the Google Gemini API endpoint.

### Verifying the key works

After providing a key, click **AI Sort** on any tab group. If the key is valid you will see suggested groupings appear within a few seconds. If you see a `403` or `API key not valid` error, double-check the key in Google AI Studio.

---

## 5. Usage

### 5.1 Drag-and-Drop Reordering

Tab Sorter AI uses `@dnd-kit/core` and `@dnd-kit/sortable` for all drag-and-drop interactions.

**Reordering tabs within a group:**
- Click and hold any tab row, then drag it up or down
- Release to drop it in the new position
- A blue insertion indicator shows the target slot

**Moving a tab to a different group:**
- Drag a tab and hover over a different group header or tab list
- The destination group highlights when it accepts the drop
- Release to move the tab

**Reordering groups:**
- Drag a group header card to rearrange the order of groups on the page

**Keyboard support:**
- Press `Space` to lift a draggable item, use arrow keys to move it, and press `Space` or `Enter` to drop

### 5.2 AI Grouping Suggestions

The **AI Sort** feature sends your tab titles and URLs to Google Gemini and returns an intelligent grouping suggestion.

1. Click the **AI Sort** button (wand icon) in the toolbar
2. The `AISorterModal` opens — optionally type a sorting preference (e.g., "group by project", "separate work from personal")
3. Click **Sort**
4. Gemini analyzes the tabs and returns a JSON grouping; the UI animates tabs into the suggested groups
5. Review the result and accept or undo

The underlying function (`getAISortingSuggestions` in `src/services/geminiService.ts`) strips Markdown code fences from the response and parses the JSON, so the raw Gemini output does not need to be clean JSON.

**Without a valid API key:** The modal displays a friendly error message and the existing tab layout is unchanged.

### 5.3 Folder System

Folders let you nest multiple tab groups under a single collapsible container.

**Creating a folder:**
- Click **+ New Folder** in the sidebar or toolbar
- Enter a name for the folder

**Customizing a folder:**
- Click the color swatch next to the folder name to pick a custom color from the color picker (powered by `react-colorful`)
- Click the icon button to choose a category icon (from the Lucide React icon set)

**Adding groups to a folder:**
- Drag any tab group and drop it onto a folder header
- The group nests under the folder and the folder expands to show it

**Collapsing and expanding:**
- Click a folder name to toggle its expanded/collapsed state

**Sharing a folder:**
- Open the folder context menu (right-click or the `...` menu icon)
- Click **Share** — a shareable link is generated and copied to your clipboard

**Deleting a folder:**
- Open the folder context menu and click **Delete**
- A confirmation dialog appears; confirming removes the folder but not its groups (they return to the top level)

### 5.4 Duplicate Detection

The app automatically scans all loaded tabs for duplicates by comparing URLs (normalized to strip trailing slashes and query parameters where appropriate).

- Tabs identified as duplicates show a **Duplicate** badge
- Click the badge to see which other tab shares the same URL
- Use the batch-select checkbox to select all duplicates at once, then click **Close Selected** to remove them

Broken tabs (404 or unreachable URLs in mock data) show a **Broken** badge and are highlighted in red.

### 5.5 Memory-Saving Mode

Memory-saving mode suspends inactive tabs to reduce simulated memory usage.

**Enabling globally:**
1. Open the **Settings** panel (gear icon)
2. Toggle **Memory Saving Mode** on
3. Set the **Inactive Threshold** (default: 7 days) — tabs not accessed within this period are automatically suspended

**Suspending a single tab manually:**
- Open the tab context menu and click **Suspend**
- The tab is marked as sleeping and its memory-usage indicator resets to near zero

**Waking a suspended tab:**
- Click the tab to restore it; the app simulates reloading the page

### 5.6 Session Save and Restore

The **End of Day** feature saves your current tab state (groups, folders, and settings) so you can restore it in a future session.

**Saving a session:**
1. Click the **End of Day** button (calendar icon) or use the keyboard shortcut
2. The `EndOfDayModal` opens showing a summary of open groups and tab count
3. Click **Save Session** — the session is stored via the Express + SQLite backend (or `localStorage` if the backend is not running)
4. A confirmation toast appears and the session appears in the **Sessions** list

**Restoring a session:**
1. Open the **Sessions** panel from the sidebar
2. Find the session by date/name
3. Click **Restore** — the tab groups and folder structure are reloaded
4. A dialog asks whether to replace the current layout or merge with it

**Session persistence:** When the Express backend is running (`src/server.ts`), sessions are stored in a SQLite database (`sessions.db`) and survive browser storage clears. Without the backend, sessions fall back to `localStorage`.

### 5.7 Auto-Tagging

Auto-tagging uses Gemini AI to generate descriptive keyword tags for a tab group based on the titles and URLs of its tabs.

**Generating tags:**
1. Open a tab group's context menu
2. Click **Generate Tags**
3. Gemini returns an array of 3–5 short tags (e.g., `["programming", "documentation", "react"]`)
4. Tags appear as pill badges below the group name

**Editing tags:**
- Click any tag to remove it
- Click **+** next to the tag list to type a custom tag manually

Tags are stored in the `TabGroup.tags` field and saved with the session.

### 5.8 Batch Operations

Select multiple tabs or folders to perform actions on all of them at once.

**Selecting tabs:**
- Click the checkbox on the left side of any tab row
- Or click the group's **Select All** checkbox to select every tab in the group
- The `react-selecto` library also supports rubber-band selection: click and drag on an empty area to draw a selection rectangle

**Batch actions (floating action bar):**
Once two or more tabs are selected, a floating action bar appears at the bottom of the screen with the following buttons:

| Action | Description |
|--------|-------------|
| Close Selected | Removes all selected tabs |
| Move to Group | Opens a picker to move selected tabs to a chosen group |
| Move to Folder | Opens a picker to move selected tab groups to a chosen folder |
| Suspend Selected | Marks all selected tabs as sleeping |
| Add Tags | Runs AI tagging on all selected groups simultaneously |

### 5.9 Dark Mode

**Enabling dark mode:**
1. Open the **Settings** panel
2. Toggle **Dark Mode** on
3. The entire UI transitions to a dark theme immediately; the preference is saved to `localStorage`

**Customizing theme colors:**
- In the Settings panel, click the accent color swatch to open the color picker
- Choose a custom accent color for buttons, highlights, and active states
- Click **Reset to Default** to restore the original color scheme

---

## 6. Testing

### Running the test suite

```bash
# Run all tests once and exit
npm test

# Run tests in watch mode — re-runs on every file save (ideal for TDD)
npm run test:watch

# Run tests with a V8 coverage report
npm run test:coverage
```

### What the 30 tests cover

The test suite lives in `src/__tests__/` and contains two files:

**`geminiService.test.ts`** — 22 tests covering the three exported functions in `src/services/geminiService.ts`:

| Describe block | Tests |
|----------------|-------|
| `getAISortingSuggestions` | Returns parsed JSON array on success; returns `null` when `GEMINI_API_KEY` is not set; strips Markdown code fences from response; returns `null` on API error; handles empty tab array; handles malformed JSON gracefully |
| `generateTagsForGroup` | Returns array of tag strings on success; returns empty array when key is not set; returns empty array on API error; handles response with extra whitespace; strips code fences; returns empty array on malformed JSON |
| `suggestGroupForTab` | Returns a valid group name on success; returns `null` when AI response is not a valid group name; returns `null` on API error; returns a random group name when key is not set; handles trimming of response whitespace; handles case-insensitive matching |

**`types.test.ts`** — 8 tests verifying TypeScript interface shapes:

| Describe block | Tests |
|----------------|-------|
| `Tab type` | Accepts required fields; accepts optional fields |
| `TabGroup type` | Accepts required fields; accepts optional tags |
| `Folder type` | Accepts required fields with timestamps |
| `Settings type` | Accepts all required settings fields; accepts valid `autoSave` enum values |
| `SavedSession type` | Accepts required fields |

All tests use `vitest` + `jsdom`. The `@google/genai` SDK is mocked via `vi.mock` at the top of `geminiService.test.ts` so no real API calls are made during testing.

### Adding new tests

1. Create a new file in `src/__tests__/` following the naming pattern `<subject>.test.ts`
2. Import from `vitest`: `import { describe, it, expect, vi } from 'vitest'`
3. Mock external modules with `vi.mock('<module-name>', () => ({ ... }))`
4. Use `vi.stubEnv('GEMINI_API_KEY', 'test-key')` in a `beforeEach` to simulate a valid key, and `vi.unstubAllEnvs()` in `afterEach` to clean up
5. Run `npm run test:watch` for instant feedback while writing

The `vitest.config.ts` automatically picks up any `*.test.ts` or `*.test.tsx` file inside `src/`. No additional registration is needed.

### Coverage report

After running `npm run test:coverage`, open `coverage/index.html` in your browser to view the full line/branch/function coverage report. Coverage is generated by V8 and configured to include all `src/**/*.{ts,tsx}` files except test files and `mock-data.ts`.

---

## 7. Production Build and Serving

### Building for production

```bash
npm run build
```

Vite compiles and bundles the app into the `dist/` directory. Expected output:

```
vite v6.x.x building for production...
✓ built in Xs
dist/index.html       X kB
dist/assets/index-XXXX.js   XXX kB
dist/assets/index-XXXX.css   XX kB
```

### Pre-deploy verification

Before deploying, run all quality checks:

```bash
npm run typecheck      # TypeScript — zero errors required
npm run lint           # ESLint + TypeScript checks
npm run format:check   # Prettier formatting check
npm test               # All 30 tests must pass
```

### Previewing the production build locally

```bash
npm run preview
```

Vite serves `dist/` at [http://localhost:4173](http://localhost:4173). Test the same scenarios you verified in dev mode to confirm the production bundle behaves identically.

### Deploying to static hosting

`dist/` is a standard Vite/React SPA. Deploy it to any static host:

| Platform | Command / Method |
|----------|-----------------|
| **Vercel** | `vercel --prod` or connect GitHub repo in the Vercel dashboard |
| **Netlify** | Drag `dist/` onto the Netlify dashboard, or use `netlify deploy --prod --dir dist` |
| **Cloudflare Pages** | Connect GitHub repo; set build command to `npm run build` and output dir to `dist` |
| **Google AI Studio** | Push to GitHub; connect in AI Studio; add `GEMINI_API_KEY` to Secrets |

Set `GEMINI_API_KEY` as an environment variable / secret on whichever platform you use. Google AI Studio also injects `APP_URL` automatically.

### Running the backend (session persistence)

The Express + SQLite backend is optional. To run it alongside the frontend:

```bash
# In one terminal — start the Vite dev server
npm run dev

# In another terminal — start the Express backend
npx tsx src/server.ts
```

The backend listens on a separate port and provides REST endpoints for saving and restoring sessions. Ensure the SQLite database directory has write permissions (see [Troubleshooting](#8-troubleshooting)).

---

## 8. Troubleshooting

### AI suggestions return empty

**Symptom:** Clicking **AI Sort** or **Generate Tags** produces no output, or the modal closes without grouping tabs.

**Steps:**
1. Open DevTools (`F12`) and check the **Console** tab for `GEMINI_API_KEY is not set`, `403`, or `API key not valid` messages
2. Verify your `.env.local` contains `GEMINI_API_KEY=` with no extra spaces, quotes, or line breaks
3. Confirm the key is active and unrestricted at [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
4. Check for `429 Too Many Requests` — the free tier has rate limits; wait 30–60 seconds and retry
5. If using the Settings panel to supply the key, ensure the key was saved (look for a success toast after clicking **Save**)

### Drag-and-drop not working

**Symptom:** Tabs do not move when dragged, or they snap back to their original position.

**Steps:**
1. Open the browser **Console** (`F12`) and check for JavaScript errors during the drag — a runtime error in any event handler can silently abort a drag operation
2. Ensure you are using a supported browser (Chrome 90+, Firefox 88+, Edge 90+, Safari 15+)
3. Disable browser extensions that intercept mouse events (some accessibility tools do this)
4. If running in an iframe or embedded context, `@dnd-kit` may not receive pointer events — run the app as a standalone tab instead
5. Try the keyboard interface: `Space` to pick up an item, arrow keys to move it, `Space` or `Enter` to drop

### Sessions not persisting

**Symptom:** Saved sessions disappear after a page reload, or the **Sessions** list is always empty.

**Steps (localStorage fallback):**
1. Open DevTools → **Application** → **Local Storage** → `http://localhost:3000`
2. Look for a `sessions` or `tabSorterSessions` key — if absent, the save operation may have failed silently; check the Console for errors
3. Ensure your browser is not in Private/Incognito mode, which clears `localStorage` on tab close

**Steps (SQLite backend):**
1. Confirm the Express backend is running (`npx tsx src/server.ts`) and listening without errors
2. Check that the working directory has write permissions for `sessions.db`:
   ```bash
   ls -la sessions.db 2>/dev/null || echo "database file not yet created"
   # If the file exists but is read-only:
   chmod 644 sessions.db
   ```
3. On Linux, if the app is run as a restricted user, the directory itself must also be writable:
   ```bash
   chmod 755 /path/to/tab-sorter
   ```
4. Look for `SQLITE_READONLY` or `SQLITE_CANTOPEN` errors in the backend terminal output

### Port 3000 already in use

```bash
# Find and kill the process on Linux/macOS
lsof -ti:3000 | xargs kill

# Or start on a different port
npx vite --port 3001
```

### `npm ci` or `npm install` fails

```bash
# Clear the npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### TypeScript or lint errors after pulling new code

```bash
# Re-install in case new packages were added
npm install

# Re-run the full quality check
npm run lint
npm run typecheck
```

### Tests fail with `Cannot find module`

```bash
npm install
npm test
```

If the issue persists, check that the import path in the failing test matches the actual file location under `src/`.
