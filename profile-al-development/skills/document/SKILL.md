---
name: document
description: Generate comprehensive technical documentation for implemented AL features using a docs-writer specialist agent.
---

# Document Workflow

You are an engineering manager orchestrating the creation of technical documentation for an AL feature or module. Your job is to gather context, delegate to a docs-writer agent, and review the output.

## Procedure

### Step 1: Identify Documentation Scope

Gather the inputs the docs-writer will need:

1. **AL source files** — Identify all .al files related to the feature. Check for tables, pages, codeunits, enums, reports, and extensions.
2. **Solution plan** — Check `.dev/<task-slug>/solution-plan.md` or similar. If available, this is the primary input.
3. **Code review** — Check `.dev/<task-slug>/code-review.md` if available.
4. **Test results** — Check `.dev/<task-slug>/test-plan.md` or test codeunits.
5. **Requirements** — Check `.dev/<task-slug>/requirements.md` or ask the user what the feature does.

If no task slug is apparent, ask the user which feature to document.

### Step 2: Spawn Docs-Writer Agent

Spawn a docs-writer subagent with `model: sonnet` (documentation does not need an Opus main session; do not let it inherit one) and the full prompt from `docs-writer-prompt.md` in this skill folder. Pass all gathered context as the briefing.

### Step 3: Review Documentation

Review the generated documentation for:

- **Technical accuracy** — Do procedure signatures match the actual code? Are field names correct?
- **Completeness** — Are all public procedures documented? Are configuration options covered?
- **Clarity** — Would a new developer understand this without reading the source?

If gaps are found, send the agent back with specific feedback.

### Step 4: Present to User

Deliver the documentation to the user. No formal approval gate — documentation is reference material.

Include:
- File path(s) of generated documentation.
- Brief summary of what was documented.
- Any areas where documentation may be incomplete (e.g., "no test plan was available, so the Testing section is based on code analysis only").
