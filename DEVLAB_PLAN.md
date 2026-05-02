# DevLab — Master Project Plan

## What this is

DevLab is a personal project management tool built for a solo developer managing 8+ active
creative and technical projects across three machines (Windows Desktop, Mac Mini M4, MacBook)
and a mobile phone. It is a single-page React app with no build step, deployed to Netlify,
with all data persisted as a JSON file in a private GitHub repository via the GitHub API.
Every save is a real git commit.

The design philosophy is Linear's: opinionated, fast, and minimal. Features earn their place.
We are explicitly not building ClickUp.

---

## Current state (what already exists and works)

The following are fully implemented and deployed:

- **Project registry** — cards with name, description, status, machines, AI model used,
  repo link, notes field, last updated timestamp
- **Status system** — Active / Paused / Released / Idea / Archived with color coding
- **Idea queue** — quick capture with timestamp, promote-to-project button
- **GitHub API backend** — reads/writes `devlab-data.json` in the repo via PAT;
  every save is a commit; SHA conflict detection with retry
- **Netlify deploy** — live URL, bookmarkable on mobile as PWA-lite
- **Filter bar** — filter projects by status
- **Setup screen** — PAT entry, repo connection, stored in localStorage
- **Responsive design** — works on desktop and mobile

The data schema currently stored in `devlab-data.json`:

```json
{
  "projects": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "status": "active | paused | released | idea | archived",
      "machines": ["Windows Desktop", "Mac Mini M4", "MacBook"],
      "lastUpdated": "ISO 8601",
      "repo": "github.com/user/repo",
      "notes": "string",
      "aiModel": "Claude | ChatGPT/Sol | Gemini | Mixed | Other",
      "createdAt": "ISO 8601"
    }
  ],
  "ideas": [
    {
      "id": "string",
      "text": "string",
      "createdAt": "ISO 8601"
    }
  ]
}
```

The app is a single `index.html` file using React 18 via CDN (no build step), Babel standalone
for JSX transpilation, and Google Fonts for typography (Barlow Condensed, DM Sans,
JetBrains Mono). The visual theme is dark terminal-meets-creative-studio.

---

## Architecture decisions (do not change these)

- **No build step** — React via CDN, Babel standalone. Keeps deployment friction zero.
- **Single file** — everything lives in `index.html`. No separate JS/CSS files.
- **GitHub as database** — `devlab-data.json` is the single source of truth.
  Read on load, write on every save. SHA tracked to prevent conflicts.
- **No backend server** — GitHub API only. PAT stored in localStorage.
- **Netlify hosting** — static file serve, `netlify.toml` already configured.
- **Mobile-first responsive** — every UI element must work on a phone screen.
- **Debounced saves** — 1.8s after last change before committing to GitHub.
  Multiple rapid changes = one commit.

---

## Phased feature plan

### Phase 1 — MVP (build this first)

Goal: Turn DevLab from a project registry into a real project management tool.
Everything in this phase must be shippable together as one release.

#### 1.1 Project detail view

Replace the current modal editor with a full project detail page (SPA navigation,
no actual URL change — show/hide views via React state).

The detail view contains:
- Project header: name, status badge, machine tags, AI model, repo link
- Edit button (opens existing modal for metadata editing)
- Task list panel (left/top)
- Notes panel (right/bottom)
- Back button → returns to dashboard

Navigation: clicking a project card on the dashboard opens its detail view.
The "Edit Project" pencil icon still opens the metadata modal.

#### 1.2 Tasks system

Each project has an array of tasks. Tasks live inside the project object in
`devlab-data.json`. Schema addition:

```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "description": "string (optional)",
      "status": "todo | in_progress | done | blocked",
      "priority": "low | medium | high | critical",
      "dueDate": "ISO 8601 (optional)",
      "order": "integer (for drag-and-drop sort)",
      "createdAt": "ISO 8601",
      "completedAt": "ISO 8601 (optional, set when status → done)"
    }
  ]
}
```

Task UI requirements:
- Task list renders inside the project detail view
- Single-line quick-add input at the top: type title, press Enter to add
- Each task row shows: drag handle, checkbox (toggles done), priority badge,
  title, due date if set, delete button
- Inline status change: click status badge to cycle through states
- Inline priority change: click priority badge to cycle through levels
- Tap/click task title to expand and show description field + due date picker
- Completed tasks visually struck through, collapsed to bottom of list
- "X of Y tasks done" counter shown in task list header

#### 1.3 Drag-and-drop task ordering

Use the HTML5 Drag and Drop API (no external library — keeps the single-file
constraint). Touch support via `touchstart`/`touchmove`/`touchend` events
for mobile.

- Drag handle icon on left of each task row
- Drag to reorder within the project task list
- Order persists to `devlab-data.json` via the `order` field
- Projects on the dashboard are also drag-reorderable (already partially
  implied by design — implement fully here)

#### 1.4 Rich notes per project

The existing short `notes` field becomes a full markdown notes area:

- Textarea with a live markdown preview toggle (Edit / Preview buttons)
- Renders headings, bold, italic, code blocks, bullet lists, links
- Markdown rendered via a lightweight parser (write a minimal one inline —
  ~50 lines covers 90% of usage; no external library needed)
- Notes panel is collapsible on mobile to give task list more room

#### 1.5 Progress indicator on project cards

On the dashboard project cards, add:
- Visual progress bar (thin, full-width, at bottom of card)
- "X / Y" task count label
- Bar is green when 100%, amber when >50%, gray when <50%
- Only shown when the project has at least one task

#### 1.6 Priority system for projects

Projects get a `priority` field in addition to their existing `status`:

```json
"priority": "none | low | medium | high | critical"
```

- Priority badge shown on project card (subtle, not dominant)
- Dashboard can be sorted by priority
- Default: `none`

---

### Phase 2 — Power features

Build after Phase 1 is stable and in daily use. Each feature is independent
and can be shipped separately.

#### 2.1 GitHub integration

Since the PAT already has `repo` scope, we can use the GitHub API to pull
live data from each project's linked repo.

Show inside the project detail view:
- **Recent commits** — last 5 commits to the linked repo's default branch
  (commit message, author, relative time, link to GitHub)
- **Open pull requests** — count + list of open PRs with title and link
- **Open issues** — count + list of open issues with title, labels, link
- **Task ↔ commit linking** — optionally paste a commit SHA or PR URL into
  a task's description; renders as a live link with the commit message fetched

Implementation notes:
- Only shown when the project has a `repo` field set
- GitHub data is fetched fresh on each project detail view open (not cached
  in devlab-data.json — it's live)
- API calls: `GET /repos/{owner}/{repo}/commits`, `/pulls`, `/issues`
- Use the existing PAT from credentials — same auth, no new setup required
- Extract owner/repo from the stored `repo` field string
- Rate limit: 5000 requests/hour for authenticated requests — not a concern
  for personal use
- Display in a collapsible "GitHub Activity" section below the task list

#### 2.2 Labels / tags on tasks

Custom labels on tasks for categorization:

- Pre-defined label types: bug, feature, refactor, research, blocked, question
- User can also type a custom label
- Labels stored as an array of strings on each task: `"labels": ["bug", "frontend"]`
- Filter task list by label within a project
- Labels shown as small color-coded chips on task rows
- Cross-project label view: a new "By Label" tab on the dashboard showing
  all tasks with a given label across all projects

#### 2.3 Sub-tasks

Nest tasks under a parent task:

- Sub-tasks are stored as a `subtasks` array within a task (same schema as tasks,
  minus the `subtasks` field — no infinite nesting)
- Parent task shows sub-task progress: "2/4 subtasks done"
- Sub-tasks collapsible under parent in the task list
- Parent task cannot be marked done if any sub-task is not done (warn, don't block)

#### 2.4 Priority dashboard ("What's hot")

A new view accessible from the main tab bar: **Focus**

Shows across all projects:
- All tasks with priority `high` or `critical` not yet done
- All tasks with a due date in the next 7 days not yet done
- Grouped by project
- Click any task to jump to its project detail view

This solves the "where do I start today?" problem for a solo developer
managing many parallel projects.

#### 2.5 Milestones

Named checkpoints within a project:

- Milestones stored in project: `"milestones": [{ "id", "title", "dueDate", "taskIds": [] }]`
- Tasks can be assigned to a milestone
- Milestone progress shown as its own mini progress bar in the project detail view
- Milestone list shown as a timeline in the project header area

#### 2.6 Global search (⌘K)

Keyboard shortcut opens a command palette / search overlay:

- Searches project names, descriptions, task titles, notes
- Results grouped: Projects / Tasks / Ideas
- Keyboard navigable (arrow keys, Enter to select)
- Clicking a result navigates to that project or task
- Implemented as a floating overlay, not a separate page

#### 2.7 Kanban board view (per project)

Toggle inside project detail view between List view and Board view:

- Columns: Todo / In Progress / Blocked / Done
- Each task is a draggable card
- Drag between columns to change status
- Same data, different presentation — no schema change needed

#### 2.8 AI task suggestions (Claude API)

Inside the project detail view, a "Suggest tasks" button:

- Sends project name, description, notes, and existing tasks to the
  Anthropic API (claude-sonnet-4-6 model)
- Asks Claude to suggest 3-5 next logical tasks given the project's current state
- Returns suggested tasks as a preview list
- User can check/uncheck which suggestions to add, then click "Add selected"
- The Anthropic API call uses the same fetch-based pattern as the rest of the app
- No API key management needed — Anthropic's claude.ai Claude-in-artifacts
  pattern is not available here since this is a standalone Netlify app.
  Requires the user to enter an Anthropic API key (stored in localStorage
  alongside the GitHub PAT). Add an API key field to the setup screen.

#### 2.9 Weekly digest

A generated summary, accessible from the main nav:

- Button: "Generate this week's digest"
- Reads all project and task data locally (no API call needed for the data)
- Displays a formatted summary:
  - Tasks completed this week (by project)
  - Tasks added this week
  - Projects with no activity in 14+ days (flagged)
  - High/critical tasks still open
  - Ideas added this week
- Option to copy digest as markdown text (for pasting into a journal, Notion, etc.)
- Optional: use Claude API to write a narrative summary from the raw data

---

### Nice-to-have (future, not prioritized)

These are acknowledged but explicitly deferred. Do not implement until
Phase 2 is complete and stable.

- Recurring tasks (auto-reset on schedule)
- Roadmap / Gantt-lite timeline view across projects
- Export project to markdown document
- PWA / service worker for offline support
- Activity log / changelog per project (auto-logged history of changes)

The following has been explicitly removed from scope:
- Time tracking (not needed for this use case)

---

## Existing projects in devlab-data.json (for context)

The user currently has these projects registered:

| Name | Status | Description |
|------|--------|-------------|
| GrabGPT | Released | Chrome extension for batch-downloading AI images |
| Delta Green Character Manager | Active | React app with KIA tracking, drag-and-drop, PDF import |
| 3D Ocean Simulation | Paused | Three.js + GLSL photorealistic ocean |
| GBC Emulator | Paused | Game Boy Color emulator in JavaScript |
| Voxel Sandbox | Paused | Minecraft-style voxel world with chunk generation |
| PromptVault | Active | Electron + Gemini app for organizing AI prompts |
| Dani Calder Autonomous Persona | Active | Fully AI-generated social media persona system |
| Story Engine | Idea | Claude Code-style agentic architecture for fiction writing |

---

## Design system (do not deviate)

**Fonts:**
- Display / headings: Barlow Condensed (700)
- Body / UI: DM Sans (300, 400, 500, 600)
- Code / mono: JetBrains Mono (400, 500)

**Color palette:**
- Background: `#08080f`
- Surface: `#10101a`
- Surface raised: `#0c0c16`
- Border default: `#18182a`
- Border emphasis: `#252538`
- Text primary: `#d8d8e8`
- Text secondary: `#7070a0`
- Text muted: `#4a4a6a`
- Text faint: `#3a3a55`
- Accent green (Active / Done): `#00e676`
- Accent amber (Paused / Warning): `#ffa726`
- Accent blue (Released / Info): `#29b6f6`
- Accent purple (Ideas): `#ce93d8`
- Accent gray (Archived): `#546e7a`
- Accent red (Blocked / Delete): `#ef5350`

**Priority colors:**
- Critical: `#ef5350` (red)
- High: `#ffa726` (amber)
- Medium: `#29b6f6` (blue)
- Low: `#546e7a` (gray)
- None: transparent / no badge

**Status colors for tasks:**
- Todo: `#4a4a6a` (muted)
- In Progress: `#ffa726` (amber)
- Done: `#00e676` (green)
- Blocked: `#ef5350` (red)

**Component patterns:**
- Cards: `background: #10101a`, `border: 1px solid #18182a`, `border-radius: 12px`
- Modals: same card style, `backdrop: rgba(0,0,0,0.8) blur(6px)`
- Input fields: `background: #0c0c16`, `border: 1px solid #1a1a2a`, `border-radius: 8px`
- Primary button: `background: #00e676`, `color: #000`, `border-radius: 9px`
- Secondary button: transparent, `border: 1px solid #1e1e2e`, `color: #7070a0`
- Badge / pill: small, rounded-99, 10px font, uppercase, letter-spacing

**Motion:**
- Page transitions: `fadeUp` animation (opacity 0→1, translateY 8px→0, 0.22s ease)
- Hover on cards: `translateY(-2px)`, `border-color` lightens, 0.18s
- Icon buttons: opacity 0.4 → 1 on hover, 0.15s

**Responsive breakpoints:**
- Mobile: ≤640px — single column, stacked layout
- Tablet: 641–980px — two column grid
- Desktop: >980px — three column grid

---

## File structure

```
devlab/
├── index.html          ← entire app (single file, no build)
├── devlab-data.json    ← data store (read/written via GitHub API)
├── netlify.toml        ← deploy config
└── README.md           ← setup guide
```

Nothing else. No package.json, no node_modules, no build output.

---

## GitHub repository

- Owner: `your-username`
- Repo: `devlab`
- Branch: `main`
- Data file: `devlab-data.json`
- Auth: Personal Access Token with `repo` scope, stored in browser localStorage
