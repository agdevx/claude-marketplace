---
name: handoff
description: Use when context is running low, the user wants to continue work in a fresh session, or the user says handoff, save context, or pick up later. Prepares everything needed for a cold start.
---

# Handoff

Prepare a complete handoff so a fresh Claude instance can pick up the current work cold — no prior context, no memory, just files and a prompt.

## Process

### 1. Audit: What's in your head that isn't in files?

Review the conversation for context that exists ONLY in chat — not yet written to any file:

- Decisions made (and the reasoning/tradeoffs behind them)
- Debates or options that were considered and rejected (and why)
- Current status: what's done, what's in progress, what's next
- Blockers, open questions, or deferred items
- Anything the user said that shaped direction but wouldn't be obvious from code/docs alone

**Be thorough.** Scan the full conversation, not just recent messages. The whole point is that context is about to disappear.

### 2. Persist: Write it down

Update the project's existing planning files with anything identified in step 1. Use whatever location the project already uses for plans or documentation — do NOT create a new convention.

If there's no obvious place, ask the user where to put it.

**After writing, verify:** Re-read the files you updated to confirm the content is actually there and complete.

### 3. Generate: Write the cold-start prompt

Create a prompt that a fresh Claude instance can use with zero prior context. The prompt must:

- **State the goal** — what are we working on and why?
- **Point to files** — list every file the new instance should read to get up to speed (plans, relevant source files, test files)
- **State current status** — what's done, what step we're on, what's next
- **Include ephemeral context** — anything that matters but doesn't belong in project files (user preferences for this task, "we agreed to keep this simple", constraints discussed verbally)
- **Be specific about the next action** — not "continue working" but "start implementing step 3: the database migration"

Keep the prompt concise but complete. A fresh instance should be able to read it and start working immediately without asking clarifying questions.

### 4. Deliver: Output and copy to clipboard

1. Output the prompt so the user can see and review it
2. Copy the prompt to the user's clipboard by invoking `agdevx-toolkit:copy-to-clipboard` via the Skill tool. Do NOT search for a clipboard tool with ToolSearch — there isn't one. The skill contains the platform-specific commands.

## Key Principles

- **Files are the source of truth.** The prompt should reference files, not duplicate their content. If something important isn't in a file, write it to one first.
- **Assume total amnesia.** The next instance knows nothing. Not the project, not the tech stack, not any decisions. Everything must be either in files or in the prompt.
- **Verify before generating.** Don't generate the prompt until you've confirmed all context is persisted. The prompt points to files — if the files are incomplete, the handoff fails.
- **Don't over-stuff the prompt.** Keep it focused. Long prompts get skimmed. Point to files for details; use the prompt for orientation and status.
