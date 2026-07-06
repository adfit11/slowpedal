#!/bin/bash
# PreToolUse hook (Bash matcher) — see .claude/settings.json.
# Blocks `git push` unless the Playwright suite (npm test) passes first.
# Any other Bash command is allowed through immediately without running tests.

input=$(cat)
command=$(echo "$input" | jq -r '.tool_input.command // empty')

if ! echo "$command" | grep -qE '(^|[;&|]|[[:space:]])git[[:space:]]+push([;&|]|[[:space:]]|$)'; then
  exit 0
fi

project_dir="${CLAUDE_PROJECT_DIR:-.}"
cd "$project_dir" || exit 0

log_file="$(mktemp -t slowpedal-prepush-test.XXXXXX)"
if npm test > "$log_file" 2>&1; then
  echo '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"allow","permissionDecisionReason":"Playwright suite passed — push allowed."}}'
else
  echo "{\"hookSpecificOutput\":{\"hookEventName\":\"PreToolUse\",\"permissionDecision\":\"deny\",\"permissionDecisionReason\":\"Playwright suite failed — fix failing tests before pushing. Output: $log_file\"}}"
fi
exit 0
