#!/bin/bash
# Stop hook — see .claude/settings.json.
#
# Auto-invokes the qa-reviewer subagent (headless) at most ONCE PER SESSION, the
# first time the working tree has uncommitted changes to the app's own source
# (index.html, css/, js/ — per CLAUDE.md's "three files" architecture; specs/tests/
# docs changes alone don't trigger this). If qa-reviewer's report contains a FAIL
# or PARTIAL verdict, this blocks the session from stopping and feeds the report
# back as the reason. A real run costs real time/money (~8 min, ~$2 as measured
# during setup) — the once-per-session cap exists specifically to bound that.
#
# Manual override: set SLOWPEDAL_DISABLE_QA_HOOK=1 in your shell to skip this
# entirely (e.g. during rapid iteration where you don't want the delay/cost).

if [ -n "$SLOWPEDAL_DISABLE_QA_HOOK" ]; then
  exit 0
fi

# Recursion guard — the headless `claude --agent qa-reviewer` call below runs in
# the same project directory and would otherwise load this exact same Stop hook
# and try to invoke itself again (as a *different* session_id, so the
# once-per-session marker below wouldn't catch it on its own).
if [ -n "$SLOWPEDAL_QA_HOOK_ACTIVE" ]; then
  exit 0
fi

project_dir="${CLAUDE_PROJECT_DIR:-.}"
cd "$project_dir" || exit 0

input=$(cat)
session_id=$(echo "$input" | jq -r '.session_id // empty' 2>/dev/null)

sessions_dir="$project_dir/.claude/hooks/.qa-reviewer-sessions"
mkdir -p "$sessions_dir"
session_marker="$sessions_dir/$session_id"

if [ -n "$session_id" ] && [ -f "$session_marker" ]; then
  # Already ran (or attempted to run) once this session — don't fire again,
  # regardless of any further changes made since.
  exit 0
fi

changed=$(git status --porcelain -- index.html css/ js/ 2>/dev/null)
if [ -z "$changed" ]; then
  exit 0
fi

# Mark this session as used now, before running — not after — so a slow run
# can't let a second Stop event (firing while this one is still in flight)
# sneak in a duplicate invocation.
[ -n "$session_id" ] && touch "$session_marker"

stderr_log="$(mktemp -t slowpedal-qa-hook-stderr.XXXXXX)"
result_json=$(SLOWPEDAL_QA_HOOK_ACTIVE=1 claude \
  --agent qa-reviewer \
  --permission-mode bypassPermissions \
  --mcp-config "$project_dir/.mcp.json" \
  --strict-mcp-config \
  --output-format json \
  -p "Review the currently uncommitted changes in this repository (check git status/git diff yourself) against their relevant spec's acceptance criteria under specs/, following your standard workflow and report format." \
  2> "$stderr_log")

is_error=$(echo "$result_json" | jq -r '.is_error // true' 2>/dev/null)
report=$(echo "$result_json" | jq -r '.result // empty' 2>/dev/null)

if [ "$is_error" = "true" ] || [ -z "$report" ]; then
  # The review itself failed to run (e.g. transient API/browser issue) — don't
  # block the whole session on our own infrastructure failing; just leave a
  # trace so it's visible something went wrong.
  {
    echo "$(date): qa-reviewer hook failed to produce a report."
    echo "stderr log: $stderr_log"
    echo "raw output: $result_json"
  } >> /tmp/slowpedal-qa-hook-errors.log
  exit 0
fi

if echo "$report" | grep -qiE '\*\*Overall verdict\*\*:[[:space:]]*(FAIL|PARTIAL)'; then
  reason=$(printf 'qa-reviewer found problems with the current changes (this was your one automatic review for this session — further changes this session will not be auto-reviewed again):\n\n%s' "$report")
  jq -n --arg reason "$reason" '{"decision": "block", "reason": $reason}'
fi

exit 0
