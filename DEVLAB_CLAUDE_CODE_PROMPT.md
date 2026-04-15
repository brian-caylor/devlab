# DevLab — Claude Code Session Prompt

Copy everything below this line and paste it as your first message to Claude Code.

---

You are helping me build out DevLab — my personal project management tool.
It is a single-file React app (`index.html`) deployed on Netlify, with all data
persisted in a `devlab-data.json` file in a private GitHub repo via the GitHub API.
Every user-facing save triggers a git commit. No build step. No package.json.

I have provided two reference documents in this repo:
- `DEVLAB_PLAN.md` — full project context, architecture decisions, design system,
  current state, and phased feature plan
- `DEVLAB_FEATURES.md` — detailed feature specs with acceptance criteria for every
  feature across Phase 1 and Phase 2

**Please read both documents fully before writing any code.**

## What I want you to build in this session

We are implementing **Phase 1** in full. That is these six features:

- FEAT-01: Project detail view (click-through from card)
- FEAT-02: Task system (add/edit/delete tasks per project)
- FEAT-03: Drag-and-drop ordering (tasks and projects)
- FEAT-04: Markdown notes (with inline parser, edit/preview toggle)
- FEAT-05: Progress bar on project cards
- FEAT-06: Project priority field

## Hard constraints — do not violate these

1. **Single file only.** Everything lives in `index.html`. No separate JS, CSS, or
   component files. If you are tempted to create another file, put it in `index.html`.

2. **No build step, no npm, no package.json.** React 18 via CDN unpkg. Babel standalone
   for JSX. Google Fonts via link tag. Any additional library must be loaded via CDN.

3. **No external markdown library.** Write an inline parser (~60 lines) that handles
   the syntax defined in FEAT-04. Do not import marked, showdown, or any other parser.

4. **No external drag-and-drop library.** Use the HTML5 Drag and Drop API for desktop.
   Write touch event handlers for mobile. Do not import react-beautiful-dnd, dnd-kit, etc.

5. **Preserve the existing design system exactly.** Fonts, colors, border-radius, spacing,
   animation — all defined in DEVLAB_PLAN.md under "Design system". Do not introduce
   new colors, new fonts, or new visual patterns.

6. **Preserve all existing functionality.** The current app has a working project
   registry, idea queue, GitHub API sync, filter bar, setup screen, and edit modal.
   None of this changes. You are adding to it.

7. **Data migration must be non-destructive.** The existing `devlab-data.json` has real
   data. Use the `normalizeProject` / `normalizeTask` pattern in DEVLAB_FEATURES.md
   to handle missing fields gracefully on load.

8. **Mobile-first.** Every new UI element must work on a phone screen. Test your
   layouts mentally at 375px width.

## Approach

1. Read DEVLAB_PLAN.md and DEVLAB_FEATURES.md.
2. Read the existing `index.html` in full to understand the current codebase.
3. Plan your changes as a list of specific edits before writing any code.
4. Implement Phase 1 features in order (FEAT-01 through FEAT-06).
5. After each feature, confirm the relevant acceptance criteria are met before moving on.
6. When finished, produce the complete updated `index.html`.

## Questions to answer before starting

Before you write a single line of code, tell me:
1. What is your plan for the SPA navigation between dashboard and project detail view?
2. How will you handle the data normalization for existing projects that have no `tasks` field?
3. What is your approach for the touch drag-and-drop on mobile?

Then wait for my confirmation before proceeding.
