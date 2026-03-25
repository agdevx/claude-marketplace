---
name: countdown
description: Use when the user asks to start a countdown timer or wants to wait a specific duration with a visible countdown.
---

# Countdown Timer

Display a countdown timer in the terminal that updates in place.

## Instructions

Parse `$ARGUMENTS` for the duration. Supported formats: `30s`, `2m`, `1m30s`, `90` (bare number = seconds).

Run this command via Bash:

```bash
TOTAL=<seconds>; LEFT=$TOTAL; while [ $LEFT -ge 0 ]; do printf "\r⏳ %02d:%02d " $((LEFT/60)) $((LEFT%60)); sleep 1; LEFT=$((LEFT-1)); done; printf "\r✅ Done!          \n"
```

Replace `<seconds>` with the parsed total in seconds.

If `$ARGUMENTS` is empty or unparseable, ask the user how long to count down.
