# CLAUDE.md

This is a configuration repository for Claude Code plugins. It contains plugin profiles, skills,
rules, agents and MCP server configurations — not application code.

## Repository structure

```
claude-configs/
├── profile-al-development/        # AL/Business Central development plugin
│   ├── .claude-plugin/plugin.json
│   ├── CLAUDE.md                  # Orchestration manager
│   ├── agents/                    # 1 agent (al-repo-summarizer, model: sonnet)
│   ├── skills/                    # 12 skills (develop, plan, fix, test, ...)
│   └── rules/                     # 5 AL guardrails
├── project-settings-template.json
└── README.md
```

## Working in this repo

- **Branch model:** `develop` for work, `master` as stable. Push to `develop`; merge to `master`
  after verification.
- **Commit style:** conventional commits (`feat`, `fix`, `docs`, `refactor`).
- **No application code lives here.** Changes affect every project that enables the plugin.
  Test in a real project before pushing.

## Plugin architecture

Plugins are self-contained directories with `.claude-plugin/plugin.json`. Projects enable them
via `extraKnownMarketplaces` + `enabledPlugins` in `.claude/settings.json`.

Configuration is additive: all enabled plugins load together.

## Rules and `globs` frontmatter

The 5 rules in `profile-al-development/rules/` carry `globs: ["**/*.al"]` frontmatter. **Claude
Code ignores `globs` and `alwaysApply`** — those are Cursor/Copilot syntax. In Claude Code, plugin
rules load unconditionally when the plugin is active. The Prodware overlay (`profile-bc-prodware`)
works around this by loading its own rules via explicit read instructions in the project CLAUDE.md.

Keep the `globs` frontmatter for Copilot compatibility. Be aware that in Claude Code, these 197
lines enter every session whether or not the task touches `.al` files.

## MCP servers

`profile-al-development` ships no MCP server. All servers come from `profile-bc-prodware` or
from the project's own `.mcp.json`. Do not add servers here — it would duplicate what the overlay
provides.

## bc-code-intel-knowledge (removed)

The `bc-code-intel-knowledge/` directory has been removed. The `bc-code-intelligence` server does
not read specialist personas from the plugin directory — it discovers configuration by path
(`~/.bc-code-intel/config.*` or `<workspace_root>/.bc-code-intel/config.*`). The measured findings
from v1.7.6 (2026-09-12) are documented in the README for reference.

## AL compilation

This profile ships no compiler script. The build route belongs to the project or the overlay
plugin:

| Setup | Route |
|---|---|
| Prodware BC workspace (`profile-bc-prodware`) | `/al-compile <extension>` |
| Copilot inside VS Code | `al_build`, `al_publish` |
| Project with `al-compile` CLI | `al-compile` (verify with `command -v`) |
| Anything else | The project's own build script |

Never mix two build routes in one session.

## Troubleshooting

See `README.md` for setup, troubleshooting and best practices.
