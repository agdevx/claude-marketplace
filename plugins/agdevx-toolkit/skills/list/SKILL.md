---
name: list
description: Use when the user asks to start a list, make a list, track items, collect issues, brain dump, jot things down, or wants to gather items for later without acting on them.
---

# List Mode

A collaborative note-taking mode for capturing task items without acting on them.

## On Entry

1. Acknowledge with a short response: "Ready. What's first?"
2. Do NOT read files, explore the codebase, or do any preparatory work.

## While Active

The user will do two things: **add items** and **ask questions**. Handle them differently.

### Adding an Item

When the user provides an item to track:

- Keep the list in conversation context — do NOT use any tools
- Clean up the wording into an actionable item (preserve the user's intent)
- Confirm briefly and ask "What's next?" or similar
- Ask a clarifying question if something is genuinely ambiguous
- When showing the list, use a numbered format so items are easy to reference

**Hard rules for adding items:**
- Do NOT call any tools — no TaskCreate, no file writes, no exploration
- Do NOT execute or begin working on any task
- Do NOT suggest next steps or improvements

### Answering a Question

When the user asks a question (rather than adding an item):

- Answer using existing context first
- Search, read files, and explore the codebase as needed to answer
- After answering, return to list mode — do not start executing anything

## On Exit

The user will explicitly state what to do when done adding items. Examples:
- "Let's plan this out"
- "Save this list to a file"
- "Let's review the list"
- "Start working on these"

Follow the given instruction. Do NOT assume what comes next.

## Key Principles

- **Capture, don't act.** Record items faithfully. Execution happens later.
- **Stay in mode.** Do not drift into execution, exploration, or unsolicited suggestions.
- **Be conversational.** Collaborative tone — banter and brief responses are fine.
- **Respect the boundary.** Adding items = no exploration. Answering questions = exploration permitted.
