# DEV LAB

Personal project tracker and idea queue. Every save is a real git commit.
Works from any browser — desktop or mobile.

---

## Setup (one time, ~10 minutes)

### 1. Create the GitHub repo

Go to [github.com/new](https://github.com/new) and create a repo called `devlab`.
- Owner: `Brian-Caylor`
- Visibility: Private (recommended)
- Skip the README, .gitignore, license — leave it empty

### 2. Clone and push these files

```bash
git clone git@github.com:Brian-Caylor/devlab.git
cd devlab
# Copy index.html, devlab-data.json, netlify.toml into this folder
git add .
git commit -m "initial devlab setup"
git push origin main
```

### 3. Create a GitHub Personal Access Token

1. Go to [github.com/settings/tokens/new](https://github.com/settings/tokens/new?scopes=repo&description=DevLab)
2. Name it: `DevLab`
3. Expiration: No expiration (or 1 year — your call)
4. Scope: check **`repo`** (full control of private repositories)
5. Click **Generate token**
6. **Copy it immediately** — you won't see it again

### 4. Deploy to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**
2. Connect GitHub → select `Brian-Caylor/devlab`
3. Build settings: leave everything blank (no build command, no build folder)
4. Click **Deploy site**
5. Netlify gives you a URL like `https://some-name-12345.netlify.app`
6. Optional: rename it in Site Settings → Domain → Change site name → e.g. `brian-devlab`

### 5. First launch

1. Open your Netlify URL on any device
2. Enter:
   - **Owner:** `Brian-Caylor`
   - **Repo:** `devlab`
   - **PAT:** paste your token from Step 3
3. Hit **Connect & Launch**
4. Your projects and ideas load from GitHub. Every change auto-saves as a commit.

### Add to your phone home screen

- **iOS Safari:** Share → Add to Home Screen
- **Android Chrome:** Menu → Add to Home Screen

Instant app-like access, no App Store required.

---

## How it works

- All data lives in `devlab-data.json` in this repo
- The app reads and writes it via the GitHub API
- Every save creates a git commit — full history, no vendor lock-in
- Credentials are stored only in your browser's localStorage (never sent anywhere except GitHub)
- If two devices save simultaneously, the second write will fail with a 409 — just tap Retry

## Data format

```json
{
  "projects": [
    {
      "id": "unique-id",
      "name": "Project Name",
      "description": "What it does",
      "status": "active | paused | released | idea | archived",
      "machines": ["Windows Desktop", "Mac Mini M4", "MacBook"],
      "lastUpdated": "ISO 8601 date",
      "repo": "github.com/user/repo",
      "notes": "Current state, next steps, blockers",
      "aiModel": "Claude | ChatGPT/Sol | Gemini | Mixed | Other",
      "createdAt": "ISO 8601 date"
    }
  ],
  "ideas": [
    {
      "id": "unique-id",
      "text": "Idea description",
      "createdAt": "ISO 8601 date"
    }
  ]
}
```

You can edit this file directly in GitHub if needed — the app will pick up changes on next sync.
