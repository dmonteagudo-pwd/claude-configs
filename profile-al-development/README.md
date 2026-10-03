# AL Development Profile - Full Lifecycle

**Version:** see `.claude-plugin/plugin.json` (the pre-commit hook bumps it).

Claude Code profile for Microsoft Dynamics 365 Business Central AL development with intelligent complexity routing and proportional planning.

## Overview

This profile provides a document-driven development workflow with specialized agents for each phase of AL development: planning, implementation, testing, and support.

## Key Features

- **Document-Driven Workflow** - All agents collaborate via `.dev/` markdown files
- **Project Memory System** - agents read `.dev/project-context.md` instead of re-exploring the codebase
- **Smart Complexity Routing** - Automatically matches workflow to task complexity
- **Proportional Planning** - Simple tasks get concise plans, complex tasks get comprehensive docs
- **Full Lifecycle Coverage** - Requirements → Design → Implementation → Testing
- **MCP Integration** - BC Intelligence, Microsoft Docs, AL Dependency navigation
- **Skill Workflows** - One skill per phase (plan, develop, test, document), run in sequence
- **Clean Context** - Agents write detailed files, return concise summaries

## Quick Start

### Enable in Your AL Project

In your AL project's `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "my-configs": {
      "source": {
        "source": "directory",
        "path": "C:/Users/<you>/claude-configs"
      }
    }
  },
  "enabledPlugins": {
    "profile-al-development@my-configs": true
  }
}
```

### Typical Sequence

There is no single end-to-end command. Run the skills in order, reviewing each output before the next:

```
/init-context                      # once per project: writes .dev/project-context.md
/interview                         # optional: unclear requirements
/plan "Add customer credit limit validation"
/develop
/test
/document                          # optional
```

Each skill writes its artifacts under `.dev/<task-slug>/`.

## Available Skills

### User-invoked only

- `/init-context` - Create `.dev/project-context.md`, read by the plan and develop workflows
- `/interview` - Deep requirements gathering (`00-interview.md`, `01-requirements.md`)
- `/plan "[description]"` - Competitive solution design by 2-3 architect agents (`01-requirements.md`, `02-solution-plan.md`)
- `/develop` - Parallel implementation plus a 4-specialist review (`03-code-review.md`, `04-deferred-issues.md`)
- `/test` - Test suite by parallel test engineers (`05-test-plan.md`)
- `/publish` - Deploy the compiled app with `bc-publish` (needs `.bcconfig.json`)
- `/run-tests` - Run tests with `al-runner` (pure logic) or `bc-test` (against a BC instance)

### Also model-invoked

- `/fix "[error or bug]"` - Lightweight bug fix with 3-tier classification
- `/document` - Technical documentation from the `.dev/<task-slug>/` artifacts
- `/verify-tests` - Adversarial test verification (`06-test-verification.md`, `06-mutations.json`)

### Background reference (not user-invocable)

- `build-tools` - Names the build, publish and test tools; the build route comes from the project or overlay
- `review-checklists` - Checklists for plans, code and tests

### Agent

- `al-repo-summarizer` - Repository overview for onboarding

## TDD Mode

`/develop` switches to strict RED-GREEN-REFACTOR when `.dev/<task-slug>/05-test-specification.md` exists. No skill writes that file: create it yourself to opt in. Protocol: `skills/test/tdd-workflow.md`; log: `03-tdd-log.md`. Each phase compiles, publishes and runs the test through the project routes, and stops for your approval.

## Build, Publish and Test Tools

The plugin ships no executables. `al-runner`, `al-mutate`, `bc-publish` and `bc-test` are optional external CLIs; check with `command -v`. The compile route comes from the project or overlay plugin. See `skills/build-tools/SKILL.md`.

`bc-publish` and `bc-test` read `.bcconfig.json` from the project root (`bc-publish --init` creates it). Keep credentials out of that file where possible and never commit it.

## MCP Servers

The plugin ships no MCP configuration. Skills use these servers when the project or an overlay plugin provides them:

- **BC Code Intelligence** - specialist guidance and best practices
- **Microsoft Docs** - official AL documentation
- **AL symbols** - base app object navigation and event discovery

## Directory Structure

```
profile-al-development/
├── .claude-plugin/
│   └── plugin.json           # Plugin metadata
├── agents/
│   └── al-repo-summarizer.md # model: sonnet
├── hooks/README.md           # no hooks shipped
├── rules/                    # 5 AL guardrails, read on demand (not auto-loaded)
├── skills/                   # 12 skills (/plan, /develop, /fix, /test, /document, ...)
├── CLAUDE.md                 # documentation; Claude Code does not load a plugin's CLAUDE.md
└── README.md                 # This file
```

## Typical Workflow

### Quick Bug Fix (5 minutes)

```bash
# Fast track for small bugs
/fix "Email validation fails for john.doe@example.com"

# Reviews:
# - Locates the issue in code
# - Shows proposed fix
# - You approve
# - Runs diagnostics
# - Done! Ready to commit
```

### Planning Only

```bash
/plan "Add dashboard for sales analytics"
# Review .dev/<task-slug>/02-solution-plan.md, then:
/develop
```

## AL Coding Standards

The guardrails live in `rules/al-*.md`. They are not auto-loaded: a project or overlay plugin decides when they are read, and its rules prevail in any conflict. This plugin sets no naming or affix convention of its own; AppSourceCop is the authority on affixes.

## Output Files

All agent work documented in `.dev/`:

```
.dev/
├── project-context.md          # /init-context
└── <task-slug>/
    ├── 00-interview.md         # /interview
    ├── 01-requirements.md      # /interview or /plan
    ├── 02-solution-plan.md     # /plan
    ├── 03-code-review.md       # /develop
    ├── 03-tdd-log.md           # /develop in TDD mode
    ├── 04-deferred-issues.md   # /develop
    ├── 05-test-specification.md# written by you to enable TDD mode
    ├── 05-test-plan.md         # /test
    ├── 06-test-verification.md # /verify-tests
    └── 06-mutations.json       # /verify-tests
```

Each skill reads the earlier artifacts: `/develop` reads `02-solution-plan.md`, `/test` and `/verify-tests` read the plan and the code.

## Benefits

### Document-Driven
- Complete audit trail
- Easy to review and iterate
- Persistent context across sessions

### Clean Main Conversation
- Agents write to files, not chat
- Concise status updates only
- No context pollution

### Full Lifecycle
- Every phase covered
- Nothing falls through cracks
- Consistent quality

### MCP Integration
- Official Microsoft documentation, BC specialist guidance and symbol navigation, when the project provides the servers

## Customization

### Project-Specific Settings

Put project conventions (object ranges, affix, naming) in the project's `CLAUDE.md` or in an overlay plugin's `rules/`. They prevail over `rules/al-*.md`. Because Claude Code loads neither a plugin's `CLAUDE.md` nor its `rules/` directory on its own, reference the rules you want applied from the project's `CLAUDE.md`.

## Troubleshooting

### Plugin Not Loading
```bash
# Verify registration
cat ~/.claude/settings.json

# Check plugin valid
cat ~/claude-configs/profile-al-development/.claude-plugin/plugin.json
```

### Skills Missing MCP Tools
- The plugin ships no MCP configuration: configure the servers in the project or an overlay plugin
- Run `/mcp` to check that they are connected

### Clean Slate
```bash
# Remove work directory to start fresh
rm -rf .dev/
```

## Recommended Hooks

Desktop notifications for when Claude needs your attention or finishes work. Add to your user or project settings (not in the plugin):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "AskUserQuestion",
        "hooks": [
          {
            "type": "command",
            "command": "notify-send -t 7000 'Claude Code' 'Question: Waiting for your answer'"
          }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "notify-send -t 5000 'Claude Code' 'Done: Ready for input'"
          }
        ]
      }
    ]
  }
}
```

**Note:** These hooks go in `~/.claude/settings.json` (user) or `.claude/settings.json` (project), not in the plugin itself. Replace `notify-send` with your system's notification command if not on Linux.

## Requirements

- Claude Code CLI
- AL Language extension
- BC development environment
- MCP servers (optional, configured by the project or an overlay):
  - BC Code Intelligence MCP
  - Microsoft Docs MCP
  - AL symbols MCP

## Contributing

Improvements to this profile benefit all your AL projects. After making changes:

```bash
cd ~/claude-configs
git add profile-al-development/
git commit -m "Improve [aspect]"
git push
```

On other computers:
```bash
cd ~/claude-configs
git pull
```

## Resources

- [AL Language Documentation](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-programming-in-al)
- [BC Best Practices](https://learn.microsoft.com/en-us/dynamics365/business-central/dev-itpro/developer/devenv-dev-best-practices)
- [Claude Code Profiles](https://docs.anthropic.com/claude/docs/claude-code)

---

**Full-lifecycle AL development with intelligent agents and document-driven workflow.**
