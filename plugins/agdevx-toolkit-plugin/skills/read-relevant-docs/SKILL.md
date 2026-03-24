---
name: read-relevant-docs
description: Use when starting a project, beginning a new session, or when the user asks to load tech-specific documentation from ~/.claude/docs.
---

# Load Project-Relevant Documentation

Read documentation from `~/.claude/docs/*` that is relevant to the current project's technology stack.

## How to Determine Relevance

1. **List available docs** by globbing `~/.claude/docs/*.md`
2. **Identify the project's tech stack** by checking for these markers in the project root:
   - `package.json` → JavaScript/TypeScript, Node.js, and any frameworks listed in dependencies
   - `tsconfig.json` → TypeScript specifically
   - `*.csproj`, `*.sln` → .NET / C#
   - `Dockerfile`, `docker-compose.yml` → Docker
   - `requirements.txt`, `pyproject.toml`, `setup.py` → Python
   - `go.mod` → Go
   - `Cargo.toml` → Rust
   - `pom.xml`, `build.gradle` → Java
   - `.github/workflows/` → CI/CD, GitHub Actions
3. **Match technologies to doc filenames** — doc files are named after their technology (e.g., `JavaScript_TypeScript.md`, `.NET_C#.md`, `Docker.md`)
4. **Read only the matching docs** — do not read docs for technologies not present in the project

## After Reading

Briefly report which docs were loaded. Do not summarize their contents.

## If No Relevant Docs Exist

State that no matching docs were found for the detected tech stack and list what was detected.
