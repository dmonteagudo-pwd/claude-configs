# Hooks — none shipped

This plugin registers no hooks: there is no `hooks/hooks.json`.

The former `PostToolUse` compile hooks were removed (audited 2026-09-12). They were POSIX
shell scripts invoked by path, which does not execute on Windows; they depended on
`python3`, `realpath` and a `/tmp` queue file; and `al-hook-compile.sh` exited early on
every run because the `al-compile` executable it probed for does not exist. Their
`Edit|Write` recorder also duplicated the one that `profile-bc-prodware/hooks/alsort.js`
registers.

Compilation goes through the overlay plugin's route (`/al-compile` in the Prodware
workspace, which wraps `scripts/compile_alc/Compile-Alc.ps1`). To reintroduce hooks here,
write them in Node (as `alsort.js` is) and add `hooks/hooks.json`.
