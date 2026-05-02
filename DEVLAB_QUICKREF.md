# DevLab — Quick Reference

## Repo
- GitHub: `your-username/devlab`
- Branch: `main`
- Data file: `devlab-data.json`
- App: `index.html` (single file, no build)
- Live: Netlify (your URL)

## Architecture in one sentence
React 18 (CDN) + Babel standalone + GitHub API as database.
PAT stored in localStorage. Every save = a git commit to devlab-data.json.

## Phase status
- [x] Phase 0 — Registry + ideas queue (SHIPPED)
- [ ] Phase 1 — Tasks, detail view, drag-drop, notes, progress, priority
- [ ] Phase 2 — GitHub integration, labels, sub-tasks, focus view,
               milestones, search, kanban, AI suggestions, digest

## Feature map

| ID | Feature | Phase | Status |
|----|---------|-------|--------|
| FEAT-01 | Project detail view | 1 | TODO |
| FEAT-02 | Task system | 1 | TODO |
| FEAT-03 | Drag-and-drop ordering | 1 | TODO |
| FEAT-04 | Markdown notes | 1 | TODO |
| FEAT-05 | Progress bar on cards | 1 | TODO |
| FEAT-06 | Project priority field | 1 | TODO |
| FEAT-07 | GitHub integration | 2 | TODO |
| FEAT-08 | Labels / tags on tasks | 2 | TODO |
| FEAT-09 | Sub-tasks | 2 | TODO |
| FEAT-10 | Focus view ("What's hot") | 2 | TODO |
| FEAT-11 | Milestones | 2 | TODO |
| FEAT-12 | Global search (⌘K) | 2 | TODO |
| FEAT-13 | Kanban board view | 2 | TODO |
| FEAT-14 | AI task suggestions | 2 | TODO |
| FEAT-15 | Weekly digest | 2 | TODO |

## Key design decisions (immutable)
- Single `index.html` file — no exceptions
- No npm, no build, no external state libs
- GitHub API only — no other backend
- Dark terminal aesthetic — colors defined in DEVLAB_PLAN.md
- Mobile-first — everything must work at 375px

## Data schema (current + Phase 1 additions)

```
project: {
  id, name, description, status, machines, lastUpdated,
  repo, notes (→ markdown), aiModel, createdAt,
  priority*,          ← FEAT-06 (default: 'none')
  tasks*: [{          ← FEAT-02
    id, title, description, status, priority,
    dueDate, order, createdAt, completedAt
  }]
}

(* = new in Phase 1)
```

## Colors cheat sheet
```
Background:     #08080f
Surface:        #10101a
Surface-raised: #0c0c16
Border:         #18182a
Text:           #d8d8e8
Text-muted:     #4a4a6a
Green (active): #00e676
Amber (paused): #ffa726
Blue (info):    #29b6f6
Purple (idea):  #ce93d8
Red (danger):   #ef5350
Gray (archive): #546e7a
```

## CDN resources already in use
```html
react@18/umd/react.production.min.js
react-dom@18/umd/react-dom.production.min.js
@babel/standalone/babel.min.js
Google Fonts: Barlow Condensed, DM Sans, JetBrains Mono
```

## How to start a Claude Code session
1. Open Claude Code in the devlab repo directory
2. Paste the contents of DEVLAB_CLAUDE_CODE_PROMPT.md as your first message
3. Claude Code will read DEVLAB_PLAN.md and DEVLAB_FEATURES.md
4. Confirm its pre-flight plan before it writes any code
