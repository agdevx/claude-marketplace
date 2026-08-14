---
name: null
description: Use when the user asks to delete NUL files, or when you notice a NUL file exists in the project. Windows creates these when reserved device names are accidentally used as filenames.
---

# Delete NUL Files

Scan for and delete Windows NUL files in the project.

## Instructions

Run this command (starts from cwd):

```bash
ERRLOG=$(mktemp)

find . -maxdepth 5 -iname "NUL" -type f 2>>"$ERRLOG" | while IFS= read -r f; do
  rm -f "$f" 2>>"$ERRLOG" || cmd.exe /c "del /f /q \"\\\\?\\$(cygpath -w "$f")\"" >>"$ERRLOG" 2>&1
  echo "Deleted: $f"
done

rm -f "$ERRLOG"
```

If `$ARGUMENTS` is provided, use that path instead of `.`

Do NOT suppress errors with `2>/dev/null` or `2>NUL` — this plugin's `block-null-redirects` hook denies those redirects on Windows, which is exactly where this skill runs. Stderr goes to a temp file instead.

If no NUL files are found, say so. If files are deleted, list what was removed.

## Why This Exists

Windows reserves device names (NUL, CON, PRN, AUX, COM1-9, LPT1-9). When tools accidentally create files with these names, they're difficult to delete through normal means. The `\\?\` prefix bypasses Windows device name resolution.
