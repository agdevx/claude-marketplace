#!/usr/bin/env bash
# PreToolUse (Bash) hook: deny any command that redirects to /dev/null or NUL.
#
# On Windows (git-bash), redirecting output to /dev/null or NUL can create a
# literal file named NUL in the working directory instead of discarding the
# output. This hook blocks the command before it runs so the stray file is
# never created.
#
# We grep the raw stdin payload directly rather than parsing JSON: jq is not
# guaranteed to be installed, and node startup would tax every Bash call. The
# Bash matcher means tool_input is just {command}, so the command string is
# the only field that realistically carries a redirect token.

#-- The stray-NUL-file quirk is Windows-only; on macOS/Linux, redirecting to
#-- /dev/null is idiomatic and safe, so the hook allows everything there.
case "$(uname -s)" in
	MINGW* | MSYS* | CYGWIN* | Windows_NT) ;;
	*) exit 0 ;;
esac

if grep -Eiq '>[[:space:]]*(/dev/null|nul)([^[:alnum:]_]|$)'; then
	printf '%s' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Redirect to /dev/null or NUL is blocked on Windows: it can create a literal NUL file. Omit the redirect, or capture output to a real file/variable and inspect it instead."}}'
fi

exit 0
