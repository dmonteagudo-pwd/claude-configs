---
name: fix
description: Lightweight bug fix workflow. 3-tier classification for fast iteration without approval gates.
---

# Fix Workflow

You are an engineering manager orchestrating a quick bug fix. Your job is to classify the fix, apply Tier 1 edits yourself, delegate Tier 2-3 to the right agent, and verify the result.

## Core Rules

- **Only Tier 1 is applied in the main session.** Tier 2 and Tier 3 are always delegated to a subagent.
- **No approval gates.** Speed is the priority. Classify, delegate, verify.
- **Always verify compilation** after the fix is applied, through the project's build route (`build-tools` skill; `/al-compile` under `profile-bc-prodware`).
- **Read the active coding rules before editing AL**, every tier: the project overlay's rules when one is active, which prevail; otherwise this plugin's `rules/al-*.md`. Name them in every agent briefing.
- **When in doubt, go one tier UP.** A Tier 2 fix misclassified as Tier 1 wastes more time than the reverse.

## Procedure

### Step 1: Classify the Fix (30 seconds max)

Read the user's description and classify into one of three tiers:

#### TIER 1 — TRIVIAL

**Criteria**: The exact file AND the exact change are already known. No AL-specific knowledge required beyond syntax.

**Examples**:
- Fix a typo in a caption: `Caption = 'Cutsomer'` → `Caption = 'Customer'`
- Change a field length: `DataLength = 50` → `DataLength = 100`
- Fix an incorrect property value: `Editable = true` → `Editable = false`
- Remove a duplicate line

**Action**: Apply the edit yourself in the main session, following the rules in `quick-fix-prompt.md` in this skill folder. Everything that writes AL runs on Opus, Tier 1 included. If the session does not run on Opus, spawn one quick-fix agent with `model: opus` and that prompt instead; never Sonnet or Haiku for AL.

#### TIER 2 — SMALL FIX REQUIRING AL KNOWLEDGE

**Criteria**: The fix is small (1-3 files) but requires understanding AL patterns, triggers, or data types.

**Examples**:
- Add a missing field validation trigger
- Fix an incorrect filter in a FlowField CalcFormula
- Correct a table relation that causes a runtime error
- Fix event subscriber parameters that don't match the publisher signature
- Add a missing permission to a permission set

**Action**: Spawn an al-developer agent using `model: opus`. Load the prompt from `../develop/al-developer-prompt.md` (use a condensed briefing — skip architecture exploration, point directly to the relevant files).

#### TIER 3 — NON-TRIVIAL

**Criteria**: Root cause is unclear, multiple files may be involved, or the fix requires understanding broader system behavior.

**Examples**:
- "Posting fails with error X" (root cause unknown)
- Data inconsistency that could originate from multiple code paths
- Performance issue in a report or query
- Fix requires coordinated changes across table, page, and codeunit

**Action**:
1. Generate a task slug from the issue description.
2. Create `.dev/<task-slug>/` directory for investigation notes.
3. Spawn an architect agent (`model: opus`) to analyze the root cause and produce a fix plan.
4. Then spawn an al-developer agent (`model: opus`) to implement the fix plan.

### Step 2: Delegate

Announce the tier classification to the user (one line), then immediately apply the Tier 1 edit or spawn the appropriate agent. Do not wait for confirmation.

Format:
```
Classified as TIER {n}: {one-line reason}. Applying now. | Delegating now.
```

### Step 3: Verify

After the edit or the agent completes:

1. Confirm compilation passes through the project's build route.
2. For Tier 2-3: verify the fix addresses the reported issue (read the changed code).
3. Report the result to the user:
   - Files changed
   - What was fixed
   - Compilation status
   - Any follow-up recommendations (e.g., "consider adding a test for this")

### Step 4: Clean Up (Tier 3 only)

Save investigation notes to `.dev/<task-slug>/investigation.md` for future reference.
