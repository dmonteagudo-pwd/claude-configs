# Claude Code Configuration Repository

This repository contains reusable Claude Code plugin configurations for streamlining development workflows across multiple projects and computers.

## Overview

This setup allows you to:
- Maintain consistent Claude Code configurations across all your projects
- Sync improvements across multiple computers via GitHub
- Compose multiple plugin profiles for specific project needs
- Keep project-specific customizations separate from shared configurations

## Repository Structure

```
claude-configs/
├── profile-al-development/    # AL (Business Central) development profile
│   ├── .claude-plugin/
│   │   └── plugin.json        # Plugin metadata
│   ├── CLAUDE.md              # AL coding standards and orchestration
│   ├── skills/                # 12 model-invoked skills (develop, plan, fix, test, ...)
│   ├── rules/                 # 5 auto-loaded AL guardrails
│   └── agents/                # 1 agent (al-repo-summarizer)
├── .gitignore
└── README.md (this file)
```

## Quick Start Configuration

Before using these plugins:

1. **Update external tool paths (optional):**
   - In `profile-al-development/.mcp.json`, update the path to the Serena tool if you're using it
   - Or remove the serena MCP server configuration if not applicable

All other paths use `~` which expands to your home directory automatically.

## Setup Instructions

### Initial Setup (First Computer)

1. **Clone this repository:**
   ```bash
   cd ~
   git clone git@github.com:YOUR_USERNAME/claude-configs.git
   ```

2. **That's it!** The plugins are now available on your computer. You'll enable them per-project (see next section).

### Setup on Additional Computers

Simply clone the repository:
```bash
cd ~
git clone git@github.com:YOUR_USERNAME/claude-configs.git
```

Plugins will be available for use in your projects immediately.

### Using Plugins in Projects

In each project where you want to use these plugins, create or edit `.claude/settings.json`:

```json
{
  "extraKnownMarketplaces": {
    "local": {
      "source": {
        "source": "directory",
        "path": "~/claude-configs"
      }
    }
  },
  "enabledPlugins": {
    "profile-al-development@local": true
  }
}
```

**Note:** The `~` expands to your home directory automatically.

#### Compose Multiple Profiles

As you add more profiles, you can combine them in a single project:
```json
{
  "extraKnownMarketplaces": {
    "my-configs": {
      "source": {
        "source": "directory",
        "path": "~/claude-configs"
      }
    }
  },
  "enabledPlugins": {
    "profile-al-development@my-configs": true,
    "profile-al-testing@my-configs": true,
    "profile-devops@my-configs": true
  }
}
```

## Workflow for Updating Configurations

### Making Improvements

When you discover a useful pattern or want to improve the configuration:

```bash
cd ~/claude-configs

# Edit files (e.g., profile-al-development/CLAUDE.md)
# Add new commands, update patterns, etc.

git add .
git commit -m "Add pattern for handling table extensions"
git push
```

### Syncing to Other Computers

On your other computer(s):

```bash
cd ~/claude-configs
git pull
```

All your projects immediately benefit from the updates without any additional configuration.

## Available Plugins

### profile-al-development

AL (Application Language) development configuration for Microsoft Dynamics 365 Business Central.

**Includes:**
- AL coding conventions and naming standards
- Best practices for table extensions, events, and error handling
- Performance optimization patterns
- Testing guidelines
- AL MCP server configuration

**Documentation:** See `profile-al-development/README.md`

## Adding New Plugins

To create a new plugin profile:

1. **Create plugin directory:**
   ```bash
   cd ~/claude-configs
   mkdir -p profile-name/{.claude-plugin,commands,skills,agents}
   ```

2. **Create plugin.json:**
   ```json
   {
     "name": "profile-name",
     "description": "Brief description of what this profile provides",
     "version": "1.0.0",
     "author": {
       "name": "Your Name"
     }
   }
   ```

3. **Add configuration files:**
   - `CLAUDE.md` - Memory/instructions
   - `commands/*.md` - Custom slash commands
   - `skills/*/SKILL.md` - Agent skills
   - `.mcp.json` - MCP server configuration

4. **Document in README:**
   - Create `profile-name/README.md`
   - Update this main README

5. **Commit and push:**
   ```bash
   git add profile-name
   git commit -m "Add profile-name plugin"
   git push
   ```

## Project-Specific Customizations

While plugins provide shared configuration, each project can still have its own customizations:

**Project directory structure:**
```
your-project/
├── .claude/
│   ├── settings.json        # Enable plugins + project-specific settings
│   ├── settings.local.json  # Personal overrides (gitignored)
│   ├── CLAUDE.md            # Project-specific instructions
│   └── commands/            # Project-only commands
```

**How it works:**
1. Plugin configurations load first (from `~/claude-configs/`)
2. Project configurations merge on top (from `your-project/.claude/`)
3. Project settings can override plugin defaults
4. All configurations are additive (commands, skills, etc. from all sources are available)

## Configuration Hierarchy

Claude Code loads configurations in this order (later overrides earlier):

1. **Enterprise managed settings** (if configured)
2. **User settings** (`~/.claude/settings.json`)
3. **User plugins** (registered in user settings)
4. **Project settings** (`.claude/settings.json`)
5. **Project plugins** (enabled in project settings)
6. **Local settings** (`.claude/settings.local.json` - gitignored)

## Security Best Practices

- Never commit sensitive data (credentials, API keys, certificates)
- Use `.gitignore` to prevent accidental commits of sensitive files
- Keep authentication in project-local files (`.env`, gitignored)
- Use permission rules in `settings.json` to deny access to sensitive paths

## Troubleshooting

### Plugin not loading

1. Verify registration in project `.claude/settings.json` (`extraKnownMarketplaces` + `enabledPlugins`)
2. Check `extraKnownMarketplaces` path is absolute (not relative)
3. Validate `plugin.json` syntax (valid JSON)
4. Run `/config` in Claude Code to see loaded plugins

### MCP server issues

1. Check `.mcp.json` syntax. Claude Code reads `.mcp.json` only — a `.mcp.jsonc` registers nothing
   and fails silently.
2. A missing server is usually a timeout, not a permission problem. These start via `npx`, and a
   cold start can exceed the default limit with no error — the server is simply absent from the
   list. Raise `MCP_TIMEOUT` (milliseconds) in `~/.claude/settings.json`.
3. `bc-code-intelligence` answering `⚠️ Server Not Yet Initialized` is not a failure: call
   `set_workspace_info` with the absolute workspace root first.
4. Test MCP servers independently.
5. Check environment variables are set correctly (`$ADO_ORG`, `$GITHUB_TOKEN`).

### Skill not found

1. Ensure plugin is enabled in project settings
2. Skill files must be in `skills/<name>/SKILL.md`
3. Check the skill list with `/help` or the session's skill listing
4. Restart Claude Code session if needed

### Changes not appearing

1. Settings and CLAUDE.md hot-reload automatically (no restart needed)
2. For command/agent changes, start a new Claude Code session
3. Verify you committed and pushed changes
4. On other computers, verify `git pull` was run

### Conflicts between plugins

- Commands from different plugins are namespaced automatically
- CLAUDE.md files from all plugins are merged
- Settings follow precedence rules (project > user > plugin)

## bc-code-intelligence knowledge layer (reference)

The `bc-code-intel-knowledge/` directory was removed from `profile-al-development`. The server
does not load specialist personas from the plugin directory. Measured against v1.7.6 (2026-09-12):

- No env var `BC_CODE_INTEL_CONFIG` is read (the old `.mcp.jsonc` name does not exist).
- `BC_CODE_INTEL_CONFIG_PATH` did not load the layer either.
- Configuration is discovered **by path**: `~/.bc-code-intel/config.{json,yaml,yml}` for the user,
  and `<workspace_root>/.bc-code-intel/config.{json,yaml,yml}` for the project.
- A layer entry needs `source.type`; omit it and the layer drops with `Layer source type is required`.
- Knowledge files must live in `domains/<domain>/<file>.md` — a flat directory indexes zero topics.
- Working shape:
  ```json
  { "layers": [{ "name": "prodware", "priority": 90, "enabled": true,
      "source": { "type": "local", "path": "<absolute path>" } }] }
  ```
- Verified: `Loaded 11534 topics from 3 layers` (11533 embedded + 1 custom).

## Best practices

1. **Test before pushing** — changes affect every project that enables the plugin
2. **Conventional commits** — `feat`, `fix`, `docs`, `refactor`
3. **Semantic versioning** — increment version in `plugin.json`
4. **Scope plugins narrowly** — one technology/domain per plugin
5. **Use approval gates** — stop for user validation at major decision points

## Resources

- [Claude Code Documentation](https://docs.claude.com/claude-code)
- [Plugin System Documentation](https://docs.claude.com/claude-code/plugins)
- [Configuration Guide](https://docs.claude.com/claude-code/configuration)

## Contributing

This is a personal configuration repository. If you're working in a team:
- Fork this repository for your own configurations
- Or create a team repository with shared configurations
- Use pull requests to review configuration changes

## License

Personal configuration repository. Use as you see fit.
