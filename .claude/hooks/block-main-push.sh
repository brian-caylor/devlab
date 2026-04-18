#!/usr/bin/env bash
# PreToolUse Bash hook — blocks commands that would land changes on `main`
# (which triggers Netlify production deploy, ~15 credits each).
# Escape hatch: include the literal token "# SHIP IT" in the command.

set -u

payload=$(cat)
cmd=$(printf '%s' "$payload" | jq -r '.tool_input.command // empty')

# Escape hatch — intentional ship
if printf '%s' "$cmd" | grep -qF '# SHIP IT'; then
  exit 0
fi

reason=""

# Rule 1: explicit `git push ... main` (before any pipe/semicolon/&&)
if printf '%s' "$cmd" | grep -Eq '(^|[[:space:];&|])git[[:space:]]+push\b[^;&|]*\bmain\b'; then
  reason="Command pushes to main."

# Rule 2: `git merge ... main`
elif printf '%s' "$cmd" | grep -Eq '(^|[[:space:];&|])git[[:space:]]+merge\b[^;&|]*\bmain\b'; then
  reason="Command merges main (if current branch is main, this lands on main)."

# Rule 3: `git checkout main` AND a push/merge in the same one-liner
elif printf '%s' "$cmd" | grep -Eq '(^|[[:space:];&|])git[[:space:]]+(checkout|switch)[[:space:]]+main\b' \
  && printf '%s' "$cmd" | grep -Eq '(^|[[:space:];&|])git[[:space:]]+(push|merge)\b'; then
  reason="Command switches to main then pushes/merges in the same line."

# Rule 4: bare `git push` (no target) while HEAD is main
elif printf '%s' "$cmd" | grep -Eq '(^|[[:space:];&|])git[[:space:]]+push\b'; then
  branch=$(git -C "$PWD" symbolic-ref --short HEAD 2>/dev/null || true)
  if [ "$branch" = "main" ]; then
    reason="Current branch is main; git push would deploy to production."
  fi
fi

if [ -n "$reason" ]; then
  jq -nc --arg reason "$reason" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: ("🚫 Main-branch write blocked: " + $reason + " Netlify production deploys cost ~15 credits each. Work on `dev` instead — branch deploys are free. To intentionally ship, append `# SHIP IT` anywhere in the command.")
    }
  }'
fi

exit 0
