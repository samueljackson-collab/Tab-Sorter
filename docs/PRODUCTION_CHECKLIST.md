# Tab Sorter AI — Production Checklist

Use this checklist before every production release. All items must be checked before tagging a release or merging to `main`.

---

## 1. Test Coverage Gate

- [ ] Run `npm test` — all **30 tests** pass with zero failures
- [ ] Run `npm run test:coverage` — overall line coverage is at or above the project threshold
- [ ] Open `coverage/index.html` and confirm no uncovered critical paths in `src/services/geminiService.ts` or `src/types.ts`
- [ ] No tests are skipped with `.skip` or `xit` unless there is a documented reason in a comment

---

## 2. Build Verification

- [ ] `npm run typecheck` exits with code `0` — zero TypeScript errors
- [ ] `npm run lint` exits with code `0` — zero ESLint errors or warnings treated as errors
- [ ] `npm run format:check` exits with code `0` — all files pass Prettier formatting
- [ ] `npm run build` completes successfully — `dist/` directory is produced with `index.html` and hashed asset files
- [ ] `npm run preview` serves `dist/` without errors at `http://localhost:4173`
- [ ] Build output size is within acceptable bounds (no accidental inclusion of large test fixtures or dev-only assets)

---

## 3. Environment and Secrets

- [ ] `.env.local` (or equivalent) is listed in `.gitignore` and is **not** committed
- [ ] `.env.example` is up to date — all required variables (`GEMINI_API_KEY`) are documented with placeholder values
- [ ] Production `GEMINI_API_KEY` is stored in the hosting platform's Secrets/Environment Variables panel, not in source code
- [ ] `APP_URL` is set correctly in the production environment (auto-injected by Google AI Studio; must be set manually for other hosts)
- [ ] No `.env` or `.env.local` files are present in the `dist/` output
- [ ] All environment variables accessed at runtime use `import.meta.env.VITE_*` naming (Vite convention); no `process.env` references in client code

---

## 4. Security

- [ ] `npm audit` reports zero **high** or **critical** severity vulnerabilities
  ```bash
  npm audit --audit-level=high
  ```
- [ ] No hardcoded API keys, tokens, or secrets anywhere in `src/` — verified with a grep:
  ```bash
  grep -rn "AIzaSy" src/
  ```
- [ ] No `console.log` statements that print user data, API keys, or internal state to the browser console in production builds
- [ ] All user-supplied input to Gemini prompts is sanitized before use
- [ ] The Settings panel API key field uses `type="password"` to prevent shoulder-surfing
- [ ] Shared folder links do not expose private tab data beyond what the user explicitly shares
- [ ] `Content-Security-Policy` headers are configured on the hosting platform if applicable

---

## 5. Functionality Smoke Test

Perform this manual walkthrough using the production build (`npm run preview`) or the live deployment:

### Core tab management
- [ ] App loads at the production URL without a blank white screen or console errors
- [ ] Mock tabs are displayed in groups on initial load
- [ ] Clicking a tab highlights it
- [ ] Closing a tab (X button) removes it from its group
- [ ] Pinning a tab marks it visually as pinned

### Drag-and-drop
- [ ] Dragging a tab within a group reorders it correctly
- [ ] **Drag-and-drop moves a tab between groups** — drop a tab onto a different group and confirm it appears there and is removed from the source group
- [ ] Dragging a group header reorders the groups

### AI features
- [ ] **AI Sort with mock data produces a non-empty grouping result** — with a valid API key, clicking AI Sort and submitting returns at least one suggested group with tabs assigned
- [ ] AI Sort with no API key shows a user-facing error and does not crash
- [ ] Generate Tags on a group returns 3–5 tag strings
- [ ] Suggest Group for a tab returns a valid group name

### Session persistence
- [ ] **Session saved and restored across a page restart** — save a session via End of Day, reload the page (or restart the server), open the Sessions panel, click Restore, and confirm the same groups and tabs reappear
- [ ] Sessions list shows the correct save date and tab count
- [ ] Deleting a session removes it from the list

### Settings
- [ ] Dark mode toggle switches the entire UI to dark theme and persists after reload
- [ ] Inactive threshold slider updates and its value is saved
- [ ] Memory Saving Mode toggle responds and its state persists

---

## 6. Performance

- [ ] App initial load (uncached) completes in under **2 seconds** on a typical broadband connection
- [ ] Drag-and-drop remains smooth (no visible jank) with **50 or more tabs** in a single group
- [ ] AI suggestions return within **10 seconds** under normal Gemini API response times
- [ ] `npm run build` produces a JavaScript bundle under **500 kB** gzipped (verify with `vite --mode production` output or `npx vite-bundle-visualizer`)
- [ ] No memory leaks observed during an extended session (use Chrome DevTools Memory tab if in doubt)
- [ ] Animations (`motion`) do not cause layout thrash — verify with DevTools Performance profiler

---

## 7. Deployment

- [ ] The CI pipeline (GitHub Actions) passes all four stages: **format → lint → test → build**
- [ ] The production branch (`main`) has no uncommitted changes
- [ ] The release is tagged in Git following the `vX.Y.Z` convention:
  ```bash
  git tag -a v1.0.0 -m "Release v1.0.0"
  git push origin v1.0.0
  ```
- [ ] The `dist/` build is deployed to the target hosting platform
- [ ] The live production URL is reachable and returns HTTP 200
- [ ] A rollback plan is documented (previous tag or previous deployment slot)

---

## 8. Documentation

- [ ] `README.md` reflects the current feature set, prerequisites (Node.js 20+), and available scripts
- [ ] `INSTALL.md` installation steps are accurate and tested on a clean machine
- [ ] `docs/GUIDE.md` covers all shipped features (drag-and-drop, AI grouping, folders, sessions, dark mode, batch operations)
- [ ] `CHANGELOG.md` (if maintained) has an entry for this release
- [ ] Any breaking changes to `.env.example` variables are documented
- [ ] The Google AI Studio deployment URL in `README.md` is up to date

---

## 9. Monitoring

- [ ] Error tracking is in place for the production deployment (e.g., Sentry, Google Cloud Error Reporting, or AI Studio's built-in logs)
- [ ] A process or alert exists to detect when the Gemini API key hits rate limits or is revoked
- [ ] Application logs (Express backend) are being captured and are accessible for debugging
- [ ] The SQLite database file (`sessions.db`) has a backup strategy or is hosted on durable storage
- [ ] Uptime monitoring is configured for the production URL (e.g., UptimeRobot, Better Uptime)

---

## 10. App-Specific Checks

These checks are unique to Tab Sorter AI and must pass in addition to the general items above:

- [ ] **Drag-and-drop moves tab between groups** — drag a tab from Group A to Group B; confirm the tab is present in Group B and absent from Group A with no console errors
- [ ] **AI Sort with mock data produces a grouping result** — load the app with pre-populated mock tabs, click AI Sort, submit with a valid key; the result must contain at least one group with one or more tabs assigned (non-empty grouping)
- [ ] **Session save persists across restart** — save a session, fully restart the Express backend (`Ctrl+C` then `npx tsx src/server.ts`), reload the browser, open Sessions, restore; the tab groups must match what was saved
- [ ] **Duplicate detection identifies known duplicates** — the mock data in `src/mock-data.ts` contains at least one pair of tabs with identical URLs; confirm that both are shown with the **Duplicate** badge on initial load
- [ ] **Memory-saving mode suspends tabs** — enable Memory Saving Mode in Settings, manually mark a tab as suspended, confirm it shows the sleeping indicator and its memory usage drops to near zero
- [ ] **Dark mode persists across reload** — enable dark mode, reload the page (`F5`), confirm the UI is still in dark mode (value persisted in `localStorage`)
- [ ] **Batch close removes all selected tabs** — select three or more tabs using checkboxes, click Close Selected in the floating action bar, confirm all selected tabs are removed and the remaining tabs are unaffected
- [ ] **Gemini model is `gemini-2.5-flash`** — verify `src/services/geminiService.ts` references `gemini-2.5-flash` and not a deprecated preview model name
- [ ] **Express backend and SQLite are functional** — `npx tsx src/server.ts` starts without errors; the `/api/sessions` endpoint responds to a GET request with valid JSON
- [ ] **Settings panel API key field is masked** — the API key input in the Settings panel renders as a password field (dots/asterisks, not plain text)
