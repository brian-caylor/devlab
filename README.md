# DEV LAB

Personal project management tool for a solo developer. Tracks projects, tasks,
ideas, milestones, and labels — with GitHub integration, AI suggestions, and
Siri quick-capture. Every save is a real git commit. Works from any browser.

**Live at:** [devlabpm.netlify.app](https://devlabpm.netlify.app)

---

## Features

**Dashboard**
- Project cards with status, priority, machines, AI model, progress bar
- Drag-and-drop reordering (desktop + mobile touch)
- Filter by status, sort by last updated / priority / custom order
- Hide projects from all views (unhide via Settings)
- Auto-import: new GitHub repos you own appear automatically on load

**Project detail view**
- Full metadata header with status, priority, machine tags, repo link
- Task list with quick-add, inline editing, status/priority cycling
- List view and Kanban board view (toggle per project)
- Markdown notes with edit/preview (inline parser, no external library)
- Milestones with progress bars and task assignment
- GitHub Activity: recent commits, open PRs, open issues (live from API)
- AI task suggestions via Claude API (optional)

**Task system**
- Status: Todo, In Progress, Blocked, Done (cycle by clicking badge)
- Priority: None, Low, Medium, High, Critical
- Due dates, descriptions, GitHub link field
- Labels: predefined (bug, feature, refactor, research, blocked, question) + custom
- Sub-tasks with completion guard on parent
- Expand/collapse inline editing

**Global views**
- Tasks tab: all tasks across all projects, filterable and sortable
- Focus tab: critical/high priority tasks, due-soon tasks, stalled projects
- Labels tab: cross-project label browser with usage counts
- Digest tab: rolling 7-day summary with optional AI narrative
- Global search (Cmd+K): projects, tasks, ideas with keyboard navigation

**Ideas**
- Quick capture with timestamp
- Promote to project
- Siri shortcut: "Hey Siri, DevLab Idea" captures from phone/watch/Mac

**Settings**
- Anthropic API key (optional, for AI features)
- Customizable nav tabs (Focus, Labels, Digest can be shown/hidden)
- Hidden projects list with unhide
- Repo disconnect

---

## Tech stack

- **Single file:** everything lives in `index.html` (no build step)
- **React 18** via CDN (unpkg), Babel standalone for JSX
- **GitHub API** as database (`devlab-data.json`, every save = commit)
- **Netlify** static hosting + one serverless function (Siri endpoint)
- **No npm, no package.json, no node_modules**

---

## Setup

### 1. GitHub repo

Create a private repo called `devlab` at [github.com/new](https://github.com/new).

### 2. Personal Access Token

1. Go to [github.com/settings/tokens/new](https://github.com/settings/tokens/new?scopes=repo&description=DevLab)
2. Scope: **`repo`** (full control of private repositories)
3. Copy the token immediately

### 3. Deploy to Netlify

1. [app.netlify.com](https://app.netlify.com) > Add new site > Import from GitHub > select `devlab`
2. Build settings: leave blank (no build command needed)
3. Deploy

### 4. Environment variables (Netlify)

Set these in Site configuration > Environment variables:

| Key | Value | Secret |
|-----|-------|--------|
| `DEVLAB_GH_TOKEN` | Your GitHub PAT | Yes |
| `DEVLAB_GH_OWNER` | Your GitHub username (e.g., `your-username`) | No |
| `DEVLAB_GH_REPO` | Your data repo name (e.g., `devlab`) | No |
| `DEVLAB_IDEA_TOKEN` | Any random string (auth for Siri endpoint) | Yes |

All four are required. The first three power the Siri idea capture function;
`DEVLAB_IDEA_TOKEN` is the bearer token your Apple Shortcut sends.

### 5. First launch

1. Open your Netlify URL
2. Enter owner, repo, and PAT on the setup screen
3. Hit Connect & Launch

### 6. Siri shortcut (optional)

Create an Apple Shortcut called "DevLab Idea":
1. **Ask for Input** — prompt: "What's the idea?"
2. **Get Contents of URL** — POST to `https://your-site.netlify.app/.netlify/functions/add-idea`
   - Header `Authorization`: `Bearer <your DEVLAB_IDEA_TOKEN>`
   - Header `Content-Type`: `application/json`
   - Request Body (JSON): key `text`, value = Provided Input
3. **Show Notification** — "Idea saved to DevLab"

Works via Siri on iPhone, Apple Watch, and Mac.

### 7. AI features (optional)

Get an API key from [console.anthropic.com](https://console.anthropic.com).
Add it in DevLab Settings (gear icon). Enables:
- AI task suggestions in project detail view
- AI narrative summary in weekly digest

---

## File structure

```
devlab/
  index.html                    # Entire app (single file)
  devlab-data.json              # Data store (read/written via GitHub API)
  netlify.toml                  # Deploy config
  netlify/functions/add-idea.js # Serverless function for Siri capture
  README.md
```

---

## How it works

- All data lives in `devlab-data.json` in this repo
- The app reads/writes it via the GitHub API using your PAT
- Every save creates a git commit — full history, no vendor lock-in
- Credentials stored only in browser localStorage
- New fields are auto-normalized on load (backward compatible)
- If two devices save simultaneously, the second write fails with 409 — tap Retry

---

## Security notes

This is a single-user app designed for personal use, with credentials stored
client-side. Be aware:

- **GitHub PAT scope.** The token requires `repo` scope (full read/write access
  to *all* your repos, public and private). Treat it like a password.
- **localStorage.** Your PAT and Anthropic API key live in browser localStorage
  in plaintext. Any browser extension you install, or any XSS bug in the app,
  can read both. Use a dedicated browser profile if that's a concern.
- **Anthropic key direct-from-browser.** The app sets
  `anthropic-dangerous-direct-browser-access: true` to call the Claude API
  without a backend proxy. Appropriate for a single-user app, but means your
  key is sent from the browser on every request — don't share your deployed
  URL with someone you don't want using your quota.
- **Siri endpoint.** `add-idea.js` accepts any text up to 2000 chars from
  whoever holds `DEVLAB_IDEA_TOKEN`. CORS is restricted to your Netlify URL.
  Rotate `DEVLAB_IDEA_TOKEN` if your phone is ever lost / shortcut leaks.
- **Public fork.** If you publish your fork publicly, make sure your data repo
  (the one referenced by `DEVLAB_GH_OWNER` / `DEVLAB_GH_REPO`) is **private**,
  or you'll publish your project history and ideas. The empty
  `devlab-data.json` shipped here is a stub, not your actual data.
