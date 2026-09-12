# Hooks — disabled

`hooks.json` is renamed to `hooks.json.disabled`. Claude Code only auto-discovers
`hooks/hooks.json`, so the renamed file registers nothing.

Reason (audited 2026-09-12): both scripts are POSIX shell invoked directly by path,
which does not execute on Windows. They also depend on `python3`, `realpath` and a
`/tmp` queue file, and `al-hook-compile.sh` exits early on every run because the
`al-compile` executable it probes for does not exist:

    command -v al-compile >/dev/null 2>&1 || { rm -f "$QUEUE_FILE"; exit 0; }

The `PostToolUse` `Edit|Write` recorder also duplicates the one that
`profile-bc-prodware/hooks/alsort.js` already registers.

Compilation in this workspace goes through `/al-compile`, which wraps
`scripts/compile_alc/Compile-Alc.ps1`. To re-enable these hooks, port both scripts to
PowerShell (or Node, as `alsort.js` is) and rename the file back.
