# Tab-Sorter — Production Launch Checklist

**Branch:** `claude/personal-launch-readiness-QHBOl`

## Pre-Launch Setup

- [ ] Node 20+ installed
- [ ] `npm install`
- [ ] Create `.env` file: `GEMINI_API_KEY=your_key_here`
- [ ] Get API key: https://aistudio.google.com/apikey
- [ ] `npm run dev` → opens at http://localhost:5173
- [ ] Run tests: `npm test` → should all pass

## Feature Verification

| Feature | Steps | Expected Result | Pass/Fail |
|---------|-------|-----------------|----------|
| App loads | Open http://localhost:5173 | Tab sorter UI with mock tabs visible | |
| Tab list | View main panel | Tabs with titles listed | |
| Create group | Click "New Group" | Group dialog with name/color fields | |
| Drag and drop | Drag a tab to a group | Tab moves to group with visual feedback | |
| AI sort | Click "AI Sort" button | Gemini groups tabs by topic | |
| gemini-2.5-flash | Check network/console during AI sort | No "model not found" error | |
| AI tag generation | Select group → "Generate Tags" | 3-5 descriptive tags returned | |
| AI group suggestion | Right-click tab → "Suggest Group" | Best matching group suggested | |
| Folder creation | Create folder of groups | Groups nest under folder | |
| Memory saver | Toggle memory saver on tab | Tab marked as sleeping | |
| Search tabs | Type in search bar | Tabs filter in real time | |
| Error state | Remove API key → AI sort | Friendly error, no crash | |
| Unit tests | `npm test` | All tests pass | |

## AI Integration

- [ ] `src/services/geminiService.ts` uses `gemini-2.5-flash` (was `gemini-3-flash-preview`)
- [ ] Sorting suggestions return valid JSON
- [ ] Tag generation returns string array

## Performance

- [ ] App starts in < 2s
- [ ] Drag-drop smooth with 50+ tabs
- [ ] AI suggestions return in < 10s
