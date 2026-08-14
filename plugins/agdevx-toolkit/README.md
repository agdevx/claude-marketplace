# agdevx-toolkit

Branch protection hooks, NUL file hygiene, .env secrecy, PR summaries, code explanation, clipboard utilities, countdown timers, session handoffs, and task list capture for Claude Code.

## Hooks

### protect-main-branch (PreToolUse)

Prevents accidental modifications to protected branches (`main`, `master`, `production`, `prod`, `release`). Blocks file writes, dangerous git commands, and branch deletion on protected branches. Provides context-aware branch name suggestions with Jira issue ID integration. Files outside the repository are automatically excluded from protection.

### block-null-redirects (PreToolUse)

Blocks Bash commands that redirect output to `/dev/null` or `NUL`, which can create a literal `NUL` file on Windows. No-op on non-Windows platforms.

### block-env-files (PreToolUse)

Denies any Bash command that touches a `.env` file (including variants like `.env.local`), keeping secrets out of the transcript. Detects `.env` filename tokens anywhere in the command while leaving `process.env`-style property access alone.

### delete-nul-files (PostToolUse)

Automatically detects and removes NUL files that Windows sometimes creates when a reserved device name is inadvertently used as a filename. Runs after file and shell operations. No-op on non-Windows platforms.

## Skills

### /pr-summary

Analyzes the current branch's changes and generates a concise PR summary ready to paste into GitHub.

### /explain-code

Explains code using analogies, ASCII diagrams, step-by-step walkthroughs, and gotcha callouts.

### /copy-to-clipboard

Copies content to the system clipboard. Cross-platform (Windows, macOS, Linux).

### /read-relevant-docs

Detects the project's tech stack and loads matching documentation from `~/.claude/docs/`.

### /list

Collaborative note-taking mode for capturing task items, brain dumps, and collected issues without acting on them. Tracks items in-context for speed.

### /countdown

Displays a countdown timer in the terminal that updates in place. Accepts durations like `30s`, `2m`, `1m30s`, or a bare number of seconds.

### /handoff

Prepares a complete handoff so a fresh session can pick up the current work cold. Audits what's in context but not yet in files, then writes everything a cold start needs.

### /null

Scans for and deletes Windows `NUL` files in the project.

## Prerequisites

- Node.js and bash (Git Bash on Windows) — used by the hook scripts

## License

[MIT](LICENSE)
