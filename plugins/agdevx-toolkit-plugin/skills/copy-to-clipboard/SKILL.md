---
name: copy-to-clipboard
description: Copy content to the system clipboard. Use when the user asks to copy text, code, or command output to clipboard.
---

# Clipboard Operations

Copy content to the system clipboard. Use the command for the current platform.

## Platform Commands

| Platform | Command |
|----------|---------|
| **Windows** | Write to temp file, then `powershell.exe Set-Clipboard`. See Windows section below. |
| **macOS** | `echo "content" | pbcopy` |
| **Linux** | `echo "content" | xclip -selection clipboard` (or `xsel --clipboard`) |

### Windows: Temp File Required

Piping from bash to PowerShell mangles Unicode (UTF-8 bytes decoded as Windows-1252). Always use a temp file:

```bash
printf '%s' "content" > /tmp/cb_tmp.txt && powershell.exe -Command "Set-Clipboard -Value (Get-Content -Path '$(cygpath -w /tmp/cb_tmp.txt)' -Raw -Encoding UTF8)" && rm /tmp/cb_tmp.txt
```

For multi-line content or file contents, write to `/tmp/cb_tmp.txt` first (via `cat <<'EOF'`, `cp`, or `>`), then run the `powershell.exe` command above.

## Multi-line Content

Use heredoc syntax to write to the temp file (Windows) or pipe directly (macOS/Linux):

```bash
cat <<'EOF' > /tmp/cb_tmp.txt
your content here
EOF
```

## After Copying

Confirm briefly: "Copied to clipboard." or "Copied N lines to clipboard."

If the clipboard command fails on Linux, suggest: `sudo apt-get install xclip`
