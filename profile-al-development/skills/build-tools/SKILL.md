---
name: build-tools
description: Quick reference for the AL build pipeline. Auto-loads when compilation, deployment or testing is mentioned. Names the tools and what each is for; the build route itself comes from the active project or overlay plugin.
user-invocable: false
---

# Build Tools Quick Reference

## Verify before routing

Every CLI below is an **optional prerequisite**, not something this plugin ships or installs. None
of them is on `PATH` by default. Check the one you need before naming it to the user:

```bash
command -v al-compile   # or al-runner, al-mutate, bc-publish, bc-test
```

If it is absent, say so and fall back to the route the project defines. Never present an absent
tool as available, and never invoke a slash command you have not seen exposed in the session.

## Compilation route

**This plugin ships no `/compile` skill and no `al-compile` script.** Compilation belongs to the
project or to the overlay plugin, because the compiler invocation, the symbol folder and the output
folder are project facts:

| Setup | Route |
|---|---|
| Prodware BC workspace (`profile-bc-prodware`) | `/al-compile <extension>` — wraps the project's `Compile-Alc.ps1` |
| Copilot inside VS Code | the `al_*` tools (`al_build`, `al_publish`) |
| A project with the `al-compile` CLI installed | `al-compile`, once `command -v al-compile` confirms it |
| Anything else | the project's own build script, named in its `CLAUDE.md` or `AGENTS.md` |

Do not mix two of these in one session: they disagree about where the `.app` is written.

## Standard cycles

**Unit test cycle (no BC required — fast):**
```
<compile route> → al-runner ./src ./test
```

**Full integration cycle (BC required):**
```
<compile route> → /publish → /run-tests (bc-test)
```

## Tool summary

| Tool | Purpose | Skill | BC required? |
|------|---------|-------|--------------|
| `al-runner` | Run pure-logic unit tests in milliseconds | `/run-tests` | No |
| `al-mutate` | Mutation testing to validate test quality | none — CLI only | No |
| `bc-publish` | Deploy `.app` to a BC server | `/publish` | Yes |
| `bc-test` | Run full integration tests via the BC OData API | `/run-tests` | Yes |

`/verify-tests` covers adversarial test verification and does not need `al-mutate`.

## Config

`bc-publish` and `bc-test` read `.bcconfig.json` from the project root. Create it with
`bc-publish --init`.

`al-runner` and `al-mutate` work straight from AL source directories — no config file.

See `/publish` and `/run-tests` for full options and usage.
