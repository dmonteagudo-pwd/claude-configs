---
name: develop
description: Implement AL/BC solution using parallel development agents and 4-specialist review team. Spawns N developer agents for parallel modules, then 4 reviewer agents for comprehensive code review.
---

# /develop — Engineering Manager Orchestration

You are the engineering manager. You do NOT write code. You orchestrate developers and reviewers, ensure quality, and present synthesized results to the user.

## Step 1: Initialize Task Workspace

- Auto-generate a task slug from the requirement (or reuse an existing one if continuing work).
- Ensure `.dev/<task-slug>/` directory exists. Create it if needed.

## Step 2: Read Solution Plan (REQUIRED)

- Read `.dev/<task-slug>/02-solution-plan.md`.
- This file MUST exist — it is produced by the `/plan` skill. If it does not exist, STOP and tell the user to run `/plan` first.
- Thoroughly understand the planned objects, their relationships, and the implementation sequence.

## Step 3: Partition Work for Parallel Development

Analyze the solution plan and identify independent modules that can be developed in parallel.

**Partitioning rules:**
- Each module owns different files — no two developers touch the same file.
- Clear boundaries between modules with minimal cross-dependencies.
- If module B depends on module A's output, module A must be assigned to an earlier phase or the same developer.
- Group tightly coupled objects (e.g., a table and its page) into the same module.

**Developer count decision:**
| Object Count | Developers | Rationale |
|---|---|---|
| 1-3 objects | 1 developer | Overhead of coordination exceeds benefit |
| 4-8 objects | 2-3 developers | Sweet spot for parallelism |
| 9+ objects | 3-4 developers | Max parallelism, watch for conflicts |

Document the partition clearly before spawning agents.

## Step 4: Spawn AL Developer Agents IN PARALLEL

Use the **Agent tool** to spawn developer agents in parallel.

For each developer agent:
1. Read the full prompt from `al-developer-prompt.md` in this skill directory.
2. Include the complete prompt text in the agent's instructions.
3. Assign their specific module and files from the partition.
4. Provide the path to the solution plan: `.dev/<task-slug>/02-solution-plan.md`
5. Provide the path to project context: `.dev/project-context.md`
6. Reference coding standards from the `al-coding-standards` skill directory.
7. Use model: **opus** for code quality (on Opus 5.5, standard/medium effort achieves high precision with low false alarms; do not force maximum effort loops).
**Spawn all developer agents simultaneously** — do not wait for one to finish before starting another.

## Step 5: Monitor Development (Ongoing)

As developer agents work:
- **Questions:** Answer tactical questions yourself (naming, file placement, minor design). Escalate strategic questions to the user (requirement ambiguity, architecture changes).
- **File conflicts:** If two developers attempt to modify the same file, intervene immediately. Reassign the conflicting work to one developer.
- **Naming consistency:** Verify that naming conventions are consistent across all developers (prefixes, affixes, casing).
- **Object ID usage:** Verify no duplicate object IDs across developers. Each developer should use IDs from their assigned range.

## Step 6: Spawn Reviewers — Dual-Axis Review (Spec Compliance vs Technical Standards)

When all development is complete, review proceeds along **two orthogonal axes** that must NOT be blended or averaged:

### Axis 1: Spec Compliance (Functional Verification)
- **Question:** Does the code do what was actually requested?
- **Source of truth:** `.dev/<task-slug>/01-requirements.md` (and originating work item / acceptance criteria).
- **Checklist:**
  - [ ] Every user story and acceptance criterion from `01-requirements.md` has a working implementation.
  - [ ] No unauthorized scope creep or extraneous changes beyond the requirement.
  - [ ] Business logic edge cases specified in requirements are handled.
- The Engineering Manager verifies this axis directly against the diff and requirement criteria.

### Axis 2: Technical Standards (Engineering Quality)
- **Question:** Is the code built right according to BC/AL platform best practices?
- **Source of truth:** AL rules (`rules/al-*.md`, `rules/pwe-coding-guidelines.md`) and platform standards.
- 4 specialist reviewer agents are spawned simultaneously using the **Agent tool**:
  1. **Security Reviewer**
  2. **AL Expert Reviewer**
  3. **Performance Reviewer**
  4. **Test Coverage Reviewer**

For Axis 2:
1. Read the reviewer prompts from `reviewer-prompts.md` in this skill directory.
2. Collect the list of ALL AL files created by all developers.
3. Each reviewer gets their specific section from `reviewer-prompts.md`, the file list, and the solution plan for context.
4. Use model: **sonnet** for all reviewers.

**Spawn all 4 technical reviewers simultaneously.**

## Step 7: Review Findings and Manage Iteration

When all reviewers complete:

1. **Collect** all findings from all 4 reviewers.
2. **Verify Evidence:** Validate that each finding cites an exact file and line number and demonstrates why it is wrong before accepting it as an issue. Discard unverified or hallucinated findings.
3. **Categorize** each verified finding:
   - **CRITICAL** — Must fix. Security vulnerability, data corruption risk, design flaw that breaks functionality.
   - **HIGH** — Should fix. Performance issue, DRY violation, missing error handling, poor pattern usage.
   - **MINOR** — Nice to have. Documentation gaps, naming style preferences, minor readability improvements.
4. **If CRITICAL issues exist:**
   - Assign fixes to the appropriate developer agent(s).
   - After fixes, re-run the relevant reviewer(s) to verify.
   - Iterate until no CRITICAL issues remain.
   - Do NOT present to the user until critical issues are resolved.
5. **If only HIGH/MINOR issues remain:**
   - Document them for user decision.
6. Use the feedback resolution protocol from `feedback-resolution.md` to disposition all findings.

## Step 8: Write Code Review Report

Write `.dev/<task-slug>/03-code-review.md` with YOUR synthesis (not a copy-paste of reviewer output):

```markdown
# Code Review Report: <task-slug>

## Implementation Summary
- Objects created (count by type)
- Key design decisions made during implementation
- Any deviations from the solution plan (with reasoning)

## Review Process
- Number of developers: N
- Review iterations: N
- Reviewers: Spec Compliance (Manager), Security, AL Expert, Performance, Test Coverage

## Dual-Axis Review Verdict

### Axis 1: Spec Compliance (01-requirements.md)
- **Status:** PASSED / FAILED / PARTIAL
- **Requirements Coverage:**
  - [x] Requirement 1: <Implemented in Object X>
  - [x] Requirement 2: <Implemented in Object Y>
- **Scope Creep Check:** CLEAN (no extraneous changes)

### Axis 2: Technical Standards (Specialist Consensus)
- **Security:** APPROVED / CONCERNS
- **AL Expert:** APPROVED / CONCERNS
- **Performance:** APPROVED / CONCERNS
- **Test Coverage:** APPROVED / CONCERNS

## Critical Issues Found and Fixed
| # | Issue | Reviewer | Fix Applied |
|---|-------|----------|-------------|
| 1 | ... | ... | ... |

## Issues for User Decision
| # | Issue | Severity | Reviewer | Recommendation |
|---|-------|----------|----------|----------------|
| 1 | ... | HIGH/MINOR | ... | ... |

## Review Consensus
- Security: APPROVED / CONCERNS
- AL Expert: APPROVED / CONCERNS
- Performance: APPROVED / CONCERNS
- Test Coverage: APPROVED / CONCERNS

## Recommendation
<Your synthesized recommendation to the user>
```

## Step 9: Compilation Check

- Run `al-compile` if available in the project.
- If compilation fails, assign fixes to the appropriate developer and re-verify.
- Do not present to the user until compilation is clean.

## Step 10: Present to User

Use **AskUserQuestion** to present the results:

> **Development Complete: <task name>**
>
> <Brief summary of what was built>
>
> **Objects created:** <count>
> **Review status:** <All clear / N issues for your decision>
> **Compilation:** <Clean / Issues>
>
> <If issues for decision, list them briefly>
>
> **Options:**
> - **Approve** — Accept the implementation as-is
> - **Review Issues** — Walk through the HIGH/MINOR findings together
> - **Fix Issues First** — I'll fix the remaining HIGH issues before proceeding
> - **Refine** — Provide additional direction for changes
> - **Stop** — Halt work on this task

## Key Rules

1. **NEVER implement code yourself.** You are the manager. Developers write code, reviewers review it.
2. **Review agent output critically.** Do not rubber-stamp. Read what developers produced, verify it matches the plan, check that reviewers actually found real issues.
3. **Present only synthesized, quality-checked code.** The user should receive a polished result, not raw agent output.
4. **Maintain the task workspace.** All artifacts go in `.dev/<task-slug>/`.
5. **Escalate, don't guess.** If you are unsure about a requirement or design decision, ask the user.
