#!/usr/bin/env bash
# PreToolUse (Bash) hook: deny any command that touches a .env file.
#
# This is the airtight backstop for the .env deny rules. Instead of enumerating
# reader commands (cat, grep, head, tail, awk, sed, editors, ...), it detects a
# ".env" *filename token* anywhere in the command, so it also catches novel
# readers (bat, pv, a custom script), input/output redirection (< .env, > .env),
# and indirect reads (python -c "open('.env')").
#
# It matches ".env" only at a path boundary and NOT followed by a letter, so
# ".env", ".env.local", "./.env", "/path/.env", '".env"' all match, while
# property access like process.env, import.meta.env, and config.environment do
# NOT — those keep working in Node one-liners.
#
# We grep the raw stdin payload directly rather than parsing JSON: jq is not
# installed in this environment, and node startup would tax every Bash call.
# The Bash matcher means tool_input is just {command}, so the command string is
# the only field that realistically carries a .env token. Tool-level
# Read/Edit/Write/Grep on .env are denied separately in settings.json; this hook
# only covers the Bash tool.

if grep -Eiq '(^|[[:space:]/\"'"'"'=~:<>|(),;&])\.env([^[:alpha:]]|$)'; then
	printf '%s' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":".env files are blocked on this machine to avoid leaking secrets into the transcript. August handles .env work himself; do not read, edit, or write .env files through any tool."}}'
fi

exit 0
