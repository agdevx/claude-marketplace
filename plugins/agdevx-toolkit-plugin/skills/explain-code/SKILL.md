---
name: explain-code
description: Use when explaining how code works, teaching about a codebase, or when the user asks "how does this work?"
---

When explaining code, follow this structure:

## 1. Analogy

Compare the code to something from everyday life. Pick something concrete and relatable.

## 2. Diagram

Use ASCII art to show the flow, structure, or relationships. Include a diagram for anything with flow, state, or relationships. Skip for trivial code (simple helpers, constants).

## 3. Walkthrough

Explain step-by-step what happens, referencing specific lines or functions.

## 4. Gotcha

Highlight a common mistake, misconception, or subtle behavior.

---

Keep explanations conversational. For modules or systems, start with a high-level diagram before diving into individual components. For complex concepts, use multiple analogies.

## Example Output

Given a middleware pipeline:

### Analogy
> Think of middleware like an airport security line. Each station (middleware) inspects your boarding pass (request), can reject you (send a response), or wave you through to the next station (`next()`). The gate agent (route handler) is always at the end.

### Diagram
```
Request
  │
  ▼
┌──────────┐    ┌──────────┐    ┌──────────┐
│  Logger  │───▶│   Auth   │───▶│  Router  │
│  next()  │    │  next()  │    │ response │
└──────────┘    └──────────┘    └──────────┘
  │                 │
  │ (logs req)      │ (checks token)
  │                 │
  │                 ├── 401 if invalid
  │                 └── next() if valid
```

### Walkthrough
1. Request hits `logger` — logs method and URL, calls `next()`
2. Request hits `auth` — checks the `Authorization` header ...
3. ...

### Gotcha
> Forgetting to call `next()` silently hangs the request. No error, no timeout warning — just a connection that never resolves.
