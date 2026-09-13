# AL Development Agents

This directory contains specialized agents for the AL development plugin.

## Available Agents

### al-repo-summarizer

Analyzes an AL (Business Central) repository and produces a structured overview: objects,
dependencies, layer classification, ID ranges, and functional domain mapping. Use when
onboarding to a new AL project or when a high-level inventory is needed.

**Invocation:** Launch via the `al-repo-summarizer` agent type.

## Architecture Note

Most workflow orchestration in this plugin is handled by **skills** (`skills/*/SKILL.md`),
not by standalone agent files. Skills like `/develop`, `/plan`, and `/test` spawn their own
internal subagents as needed. See `CLAUDE.md` for the full skill catalogue.
