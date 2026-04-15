# DevLab — Feature Specifications

This document provides detailed acceptance criteria for each feature.
Claude Code should treat each section as a complete spec for one unit of work.

---

## Phase 1 features (build in order)

---

### FEAT-01: Project detail view

**What:** Replace project card click (currently opens edit modal) with a full detail view.
The edit modal is still reachable via the pencil icon.

**Trigger:** Clicking anywhere on a project card *except* the edit/delete buttons.

**Layout (desktop):**
```
┌─────────────────────────────────────────────────────┐
│ ← Back    PROJECT NAME              [Edit] [Status] │
│           machine tags · AI model · repo ↗          │
├─────────────────────────────────┬───────────────────┤
│  TASKS                          │  NOTES            │
│  [+ Add a task...]              │  [Edit | Preview] │
│  ─────────────────              │                   │
│  □ Task one          ⚡High     │  Markdown content │
│  □ Task two          · Med      │  renders here     │
│  ✓ Task three (done)            │                   │
│                                 │                   │
│  3 tasks · 1 done               │                   │
├─────────────────────────────────┴───────────────────┤
│  GitHub Activity (collapsible) — only if repo set   │
└─────────────────────────────────────────────────────┘
```

**Layout (mobile):** Stacked — header, then tasks full width, then notes full width,
then GitHub activity.

**Navigation state:** Managed in React state (`view: 'dashboard' | 'project'` + `activeProjectId`).
No URL routing needed. Browser back button does NOT navigate (acceptable limitation).

**Back button:** Top-left, returns to dashboard, preserves scroll position.

**Acceptance criteria:**
- [ ] Clicking a project card opens its detail view
- [ ] Pencil icon still opens the edit modal (metadata only)
- [ ] Detail view shows all existing project metadata in header
- [ ] Back button returns to dashboard
- [ ] Mobile layout stacks correctly at ≤640px
- [ ] Page transition uses fadeUp animation

---

### FEAT-02: Task system

**Schema addition to each project in devlab-data.json:**
```json
"tasks": [
  {
    "id": "uid()",
    "title": "string, required",
    "description": "string, optional, default ''",
    "status": "todo",
    "priority": "medium",
    "dueDate": null,
    "order": 0,
    "createdAt": "ISO 8601",
    "completedAt": null
  }
]
```

**Task row anatomy (collapsed):**
```
[≡] [□] [⚡ High] Task title text         [Apr 18] [×]
drag  check  priority               due date  delete
```

**Task row anatomy (expanded — click title to toggle):**
```
[≡] [□] [⚡ High] Task title text         [Apr 18] [×]
     ┌─ Description: [textarea, editable inline] ───┐
     │  Due date:    [date input]                    │
     │  Status:      [Todo ▾]                        │
     └──────────────────────────────────────────────┘
```

**Status cycling (click badge):** todo → in_progress → blocked → done → todo
**Priority cycling (click badge):** none → low → medium → high → critical → none

**Quick-add input:**
- Placeholder: "Add a task… press Enter to save"
- Enter key adds task with default status=todo, priority=medium
- Input stays focused after adding (for rapid entry)
- Escape clears and blurs input

**Completion behavior:**
- Checking the checkbox sets status to `done` and records `completedAt`
- Unchecking sets status back to `todo` and clears `completedAt`
- Done tasks visually: text struck through, opacity 0.45, sorted to bottom
- Done tasks still draggable but grouped at bottom

**Acceptance criteria:**
- [ ] Quick-add input adds task on Enter
- [ ] Input stays focused after adding
- [ ] Task rows render all fields correctly
- [ ] Clicking priority badge cycles priority
- [ ] Clicking status badge cycles status
- [ ] Checking checkbox marks task done, strikes through text
- [ ] Done tasks sink to bottom of list
- [ ] Expanding a task shows description and due date fields
- [ ] Edits to expanded task save on blur (debounced GitHub save triggers)
- [ ] Delete button removes task after confirmation
- [ ] Task count "X / Y done" shown in list header
- [ ] All changes persist to devlab-data.json via GitHub API

---

### FEAT-03: Drag-and-drop ordering

**Tasks:** Drag-reorderable within a project's task list.
**Projects:** Drag-reorderable on the dashboard.

**Implementation (no external library):**

Use HTML5 Drag and Drop API for desktop:
- `draggable="true"` on each task row
- `dragstart`, `dragover`, `drop`, `dragend` event handlers
- Visual: dragged item opacity 0.4, drop target shows accent border
- After drop: update `order` field on all affected tasks, trigger save

Touch support for mobile (same UX, different events):
- `touchstart`: record starting position and item
- `touchmove`: translate item position via `transform: translateY()`
- `touchend`: calculate drop target based on final Y position, reorder, reset transform

**Persistence:**
- `order` is an integer. After reorder, reassign order values as 0, 1, 2, 3…
- On load, tasks are sorted by `order` ascending

**Acceptance criteria:**
- [ ] Tasks can be reordered by dragging on desktop
- [ ] Tasks can be reordered by touch-dragging on mobile
- [ ] Visual feedback during drag (opacity, border)
- [ ] Order persists across page reloads
- [ ] Projects can be reordered on the dashboard (same mechanism)

---

### FEAT-04: Markdown notes

**What:** The existing `notes` field on each project becomes a full markdown notes area.

**UI:** Two-button toggle at top of notes panel: `[Edit]` `[Preview]`
- Edit mode: plain textarea, monospace font, full height of panel
- Preview mode: rendered markdown, same panel

**Markdown parser:** Write a minimal inline parser supporting:
- `# ## ###` headings
- `**bold**` and `*italic*`
- `` `inline code` `` and triple-backtick code blocks
- `- ` and `* ` bullet lists
- `1. ` numbered lists
- `[text](url)` links (open in new tab)
- `---` horizontal rule
- Line breaks preserved

Do NOT use an external markdown library. A ~60-line inline parser is sufficient.

**Mobile behavior:** Notes panel is collapsed by default on mobile (≤640px).
A "Notes ▾" toggle button expands it below the task list.

**Acceptance criteria:**
- [ ] Edit/Preview toggle works
- [ ] All listed markdown syntax renders correctly in preview
- [ ] Code blocks use JetBrains Mono font
- [ ] Links open in new tab
- [ ] Notes save debounced to GitHub
- [ ] Mobile: collapsed by default, expandable
- [ ] Notes content preserved when switching views

---

### FEAT-05: Progress bar on project cards

**What:** Add a visual progress indicator to each project card on the dashboard.

**Display:**
- Only shown if the project has at least 1 task
- "X / Y" label (e.g. "3 / 7")
- Thin progress bar (4px height, full card width, at bottom of card)
- Colors: 0% = `#18182a` (empty), 1-99% = `#ffa726` (amber), 100% = `#00e676` (green)
- Bar uses CSS `width` percentage transition (0.3s ease)

**Acceptance criteria:**
- [ ] Cards with no tasks show no progress bar
- [ ] Cards with tasks show correct count and bar
- [ ] Bar color changes at 100%
- [ ] Bar animates on percentage change

---

### FEAT-06: Project priority field

**Schema addition:**
```json
"priority": "none | low | medium | high | critical"
```

**Display on card:** Small priority badge in card header, right-aligned.
Only shown if priority ≠ `none`.

**In edit modal:** Priority selector added (chip buttons, same style as Status).

**Dashboard sort:** Add "Sort by priority" option to toolbar.
Priority order: critical → high → medium → low → none.
Secondary sort: by `lastUpdated` descending.

**Acceptance criteria:**
- [ ] Priority field added to data schema (default `none`)
- [ ] Priority selector in edit modal
- [ ] Priority badge shown on card when ≠ none
- [ ] Dashboard sort by priority works
- [ ] Existing projects without priority field default to `none` gracefully

---

## Phase 2 features

---

### FEAT-07: GitHub integration

**Trigger:** Shown in project detail view only when `project.repo` is set.

**Displayed in a collapsible "GitHub Activity" section below the task list.**

**Data fetched (on detail view open):**

1. Recent commits:
   ```
   GET https://api.github.com/repos/{owner}/{repo}/commits?per_page=5
   ```
   Display: commit message (truncated at 72 chars), author login, relative time,
   link to commit on GitHub.

2. Open pull requests:
   ```
   GET https://api.github.com/repos/{owner}/{repo}/pulls?state=open
   ```
   Display: PR title, number, author, link.

3. Open issues:
   ```
   GET https://api.github.com/repos/{owner}/{repo}/issues?state=open&per_page=10
   ```
   Note: GitHub issues API includes PRs — filter out items with `pull_request` key.
   Display: issue title, number, labels, link.

**Repo field parsing:**
The stored `repo` field may be:
- `github.com/Brian-Caylor/grabgpt`
- `https://github.com/Brian-Caylor/grabgpt`
- `Brian-Caylor/grabgpt`

Parse to extract `owner` and `repo` reliably.

**Auth:** Use the existing PAT from credentials (`creds.token`).
Headers: `Authorization: Bearer {token}`, `Accept: application/vnd.github.v3+json`

**Error handling:**
- Repo not found / no access: show "Could not load GitHub data" message quietly
- Empty results: show "No commits / PRs / issues" gracefully
- Rate limit: show remaining requests in small footer text

**Task-to-commit linking:**
- In the expanded task view, a "Link to GitHub" field (text input)
- User pastes a commit SHA, PR URL, or issue URL
- Stored in task as `"githubLink": "string"`
- Rendered as a clickable chip with the commit/PR/issue reference fetched and shown

**Acceptance criteria:**
- [ ] Section only appears when repo is set
- [ ] Commits, PRs, and issues load correctly
- [ ] PRs are excluded from issues list
- [ ] Relative times are human-readable (e.g. "2 hours ago", "3 days ago")
- [ ] All links open in new tab pointing to GitHub
- [ ] Section is collapsible
- [ ] GitHub link field on tasks works for commit SHAs and URLs
- [ ] Errors are handled gracefully without crashing the view

---

### FEAT-08: Labels / tags on tasks

**Schema addition:**
```json
"labels": ["bug", "frontend"]
```

**Predefined labels with colors:**
- `bug` → red `#ef5350`
- `feature` → green `#00e676`
- `refactor` → blue `#29b6f6`
- `research` → purple `#ce93d8`
- `blocked` → red `#ef5350` (same as bug but different text)
- `question` → amber `#ffa726`
- Custom: user-typed, rendered in neutral gray `#4a4a6a`

**In expanded task view:** Label selector — shows predefined options as chips,
plus a text input for custom labels.

**In task list:** Labels shown as small chips after the task title.

**Filter bar in task list:** "Filter by label" dropdown — shows all labels used
in this project. Selecting filters to matching tasks only.

**Cross-project "By Label" view:**
- New tab on dashboard: `Labels`
- Shows all labels used across all projects
- Clicking a label shows all tasks with that label across all projects,
  grouped by project

**Acceptance criteria:**
- [ ] Labels can be added/removed in expanded task view
- [ ] Custom labels can be typed
- [ ] Labels render as colored chips on task rows
- [ ] Task list can be filtered by label
- [ ] Cross-project label view shows correctly

---

### FEAT-09: Sub-tasks

**Schema addition inside a task:**
```json
"subtasks": [
  {
    "id": "uid()",
    "title": "string",
    "status": "todo | done",
    "order": 0,
    "createdAt": "ISO 8601"
  }
]
```

Sub-tasks are intentionally simple — title and done/not-done only. No nesting beyond one level.

**In expanded task view:**
- Sub-task list with quick-add input (same pattern as main task list)
- Each sub-task: checkbox + title + delete
- Reorderable via drag-and-drop
- "X / Y subtasks done" shown on parent task row when collapsed

**Parent completion guard:**
- If a parent task is checked done while sub-tasks are incomplete:
  show a confirmation: "X sub-tasks are not done. Mark parent done anyway?"
- If confirmed, marks parent done. Sub-tasks remain in their state.

**Acceptance criteria:**
- [ ] Sub-tasks can be added in expanded task view
- [ ] Sub-task completion updates the parent's progress display
- [ ] Parent shows "X / Y subtasks done" when collapsed
- [ ] Completion guard fires when applicable
- [ ] Sub-tasks persist to devlab-data.json

---

### FEAT-10: Focus view ("What's hot")

**New tab in main nav:** `Focus`

**Content — three sections:**

1. **Critical & high priority** — all undone tasks with priority `high` or `critical`
   across all projects, sorted by priority then project.

2. **Due soon** — all undone tasks with a `dueDate` within the next 7 days,
   sorted by due date ascending. Overdue tasks shown with red date.

3. **Stalled projects** — projects with status `active` and no task activity
   (no `lastUpdated` change) in 14+ days. A gentle flag, not an alarm.

Each task in sections 1 and 2 shows its project name as a link that opens
that project's detail view.

**Empty state:** "Nothing urgent. Go build something."

**Acceptance criteria:**
- [ ] Focus tab visible in main nav
- [ ] Critical/High section shows correct tasks
- [ ] Due soon section shows correct tasks, overdue in red
- [ ] Stalled projects flagged correctly
- [ ] Clicking task navigates to project detail
- [ ] Empty state message shown when nothing qualifies

---

### FEAT-11: Milestones

**Schema addition inside a project:**
```json
"milestones": [
  {
    "id": "uid()",
    "title": "string",
    "dueDate": "ISO 8601 or null",
    "taskIds": ["task-id-1", "task-id-2"]
  }
]
```

**In project detail view:**
- Milestones shown above the task list as a horizontal timeline (desktop)
  or vertical list (mobile)
- Each milestone: title, due date, progress bar (based on taskIds completion)
- "+ Add milestone" button opens a small modal: title + due date

**Assigning tasks to milestones:**
- In expanded task view: "Milestone" dropdown — lists this project's milestones
- Task stores `"milestoneId": "string or null"`

**Milestone progress:**
- Completion % = done tasks in `taskIds` / total tasks in `taskIds`
- Shown as a thin progress bar under the milestone name

**Acceptance criteria:**
- [ ] Milestones can be created with title and due date
- [ ] Tasks can be assigned to a milestone
- [ ] Milestone progress bar updates with task completion
- [ ] Milestone timeline renders on desktop, list on mobile
- [ ] Milestones persist to devlab-data.json

---

### FEAT-12: Global search (⌘K)

**Trigger:** `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux). Also a search icon in the header.

**UI:** Full-screen overlay, centered search input, results below.
Background: `rgba(0,0,0,0.85)` blur. Same modal pattern as existing modals.

**Search scope:** Project names, descriptions, notes, task titles, idea text.

**Results structure:**
```
Projects (2)
  ─ GrabGPT
  ─ PromptVault

Tasks (4)
  ─ Add Firefox port support  [GrabGPT]
  ─ Fix audio timing issue    [GBC Emulator]

Ideas (1)
  ─ Browser extension that auto-summarizes tabs
```

**Behavior:**
- Results update as user types (debounced 150ms)
- Keyboard: arrow keys navigate results, Enter selects, Escape closes
- Clicking a project result opens its detail view
- Clicking a task result opens its project detail view (task auto-expanded)
- Search is client-side only (no API call) — searches in-memory data

**Acceptance criteria:**
- [ ] ⌘K / Ctrl+K opens search
- [ ] Results update as user types
- [ ] Results grouped by type
- [ ] Keyboard navigation works
- [ ] Clicking result navigates correctly
- [ ] Escape closes

---

### FEAT-13: Kanban board view

**Toggle in project detail view header:** `[≡ List]` `[▦ Board]`
Preference stored in localStorage per project.

**Board layout:**
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│  TODO       │  IN PROGRESS│  BLOCKED    │  DONE       │
│  (3)        │  (2)        │  (1)        │  (4)        │
├─────────────┼─────────────┼─────────────┼─────────────┤
│ [Task card] │ [Task card] │ [Task card] │ [Task card] │
│ [Task card] │ [Task card] │             │ [Task card] │
│ [Task card] │             │             │ [Task card] │
│             │             │             │ [Task card] │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

**Task card in board view:** Priority badge, title, due date if set, label chips.
**Drag between columns:** Changes task status. Uses same HTML5 DnD as task list.
**Mobile:** Columns scroll horizontally (overflow-x: auto on board container).

**Acceptance criteria:**
- [ ] Toggle between list and board view
- [ ] All tasks appear in correct column
- [ ] Dragging between columns changes status
- [ ] Task cards show priority, labels, due date
- [ ] Mobile horizontal scroll works
- [ ] View preference remembered per project

---

### FEAT-14: AI task suggestions (Claude API)

**Setup addition:** Add "Anthropic API Key" field to the setup/settings screen.
Stored in localStorage as `devlab-anthropic-key`. Optional — feature gracefully
absent if not set.

**In project detail view:** "✨ Suggest tasks" button below the task quick-add input.
Only shown when Anthropic API key is set.

**API call:**
```javascript
POST https://api.anthropic.com/v1/messages
Headers: {
  "x-api-key": anthropicKey,
  "anthropic-version": "2023-06-01",
  "content-type": "application/json"
}
Body: {
  model: "claude-sonnet-4-6",
  max_tokens: 1000,
  messages: [{
    role: "user",
    content: `You are helping a solo developer manage their project tasks.

Project: ${project.name}
Description: ${project.description}
Current notes: ${project.notes}
Existing tasks: ${project.tasks.map(t => `- [${t.status}] ${t.title}`).join('\n')}

Suggest 4-5 specific, actionable next tasks for this project. Each task should be
concrete enough to complete in one sitting. Consider what's already done and what
logical next steps would be.

Respond ONLY with a JSON array of task title strings. No explanation, no markdown,
no extra text. Example format: ["Task one", "Task two", "Task three"]`
  }]
}
```

**Response handling:**
- Parse JSON array from response
- Show suggestions as a checklist below the quick-add input
- Each suggestion: checkbox (default checked) + title
- "Add X selected tasks" button adds checked items as new tasks
- "Dismiss" closes the suggestion panel

**Loading state:** "✨ Thinking..." with a subtle pulse animation.

**Error handling:** If API call fails, show "Couldn't reach Claude. Check your API key." quietly.

**Acceptance criteria:**
- [ ] API key field in settings, stored in localStorage
- [ ] Button visible only when key is set
- [ ] Suggestions load and display as checklist
- [ ] User can check/uncheck suggestions
- [ ] Selected suggestions added as tasks
- [ ] Loading state shown during API call
- [ ] Errors handled without crashing

---

### FEAT-15: Weekly digest

**Location:** New "Digest" option in a header dropdown or secondary nav.

**Digest content (generated from local data — no API call required for data):**

```markdown
# DevLab Weekly Digest
Week of April 14 – April 20, 2026

## Completed this week (12 tasks)
**GrabGPT** (3)
  ✓ Added batch download for DALL-E images
  ✓ Fixed filename collision bug
  ✓ Released v1.1 to Chrome Web Store

**Delta Green Character Manager** (2)
  ✓ PDF import working for pre-gen sheets
  ✓ KIA flag animation added

## Added this week (8 tasks)
  + [GrabGPT] Firefox port investigation
  + [PromptVault] Add prompt tagging UI
  ...

## Active projects needing attention
  ⚠ 3D Ocean Simulation — no activity in 15 days
  ⚠ Voxel Sandbox — no activity in 22 days

## Open critical/high priority tasks (4)
  🔴 [GBC Emulator] Fix audio timing — Critical
  🟡 [PromptVault] Add search — High
  ...

## Ideas captured this week (1)
  💡 Browser extension that auto-summarizes open tabs

---
Generated by DevLab · Brian-Caylor/devlab
```

**"AI narrative" option (if Anthropic key set):**
Button: "✨ Write narrative summary" — sends the raw digest data to Claude API,
asks for a brief (150 word max) narrative paragraph summarizing the week.
Rendered below the structured digest.

**Copy button:** Copies the full digest as markdown to clipboard.

**Acceptance criteria:**
- [ ] Digest correctly identifies tasks completed this week (using `completedAt`)
- [ ] Digest correctly identifies tasks added this week (using `createdAt`)
- [ ] Stalled projects flagged (14+ days no `lastUpdated`)
- [ ] High/critical open tasks listed
- [ ] Ideas from this week listed
- [ ] Copy to clipboard works
- [ ] AI narrative generates when key available
- [ ] Date range is current Mon–Sun (or last 7 days)

---

## Data migration strategy

When adding new fields to the schema, the app must handle existing data gracefully.
Pattern for all new fields:

```javascript
// When reading a project, fill missing fields with defaults
const normalizeProject = (p) => ({
  priority: 'none',
  tasks: [],
  milestones: [],
  ...p,
  tasks: (p.tasks || []).map(normalizeTask),
});

const normalizeTask = (t) => ({
  description: '',
  priority: 'medium',
  dueDate: null,
  order: 0,
  completedAt: null,
  labels: [],
  subtasks: [],
  githubLink: null,
  milestoneId: null,
  ...t,
});
```

Apply normalization on every load, before any data is rendered.
This ensures existing devlab-data.json works without manual migration.
