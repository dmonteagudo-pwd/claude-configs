# TDD RED-GREEN-REFACTOR Protocol

Shared reference for the `/develop` skill. It defines the strict TDD workflow that applies when TDD mode is active: `.dev/<task-slug>/05-test-specification.md` exists. No skill generates that file; the user writes it to opt in.

## Core TDD Principles

1. **RED --> GREEN --> REFACTOR --> repeat**
2. **NEVER** implement logic before the user confirms the test FAILS
3. **NEVER** skip approval gates between phases
4. **NEVER** batch multiple cycles — one test at a time
5. **ALWAYS** use AskUserQuestion at phase gates (BLOCKING — do not proceed without user response)

---

## Phase 1: RED — Write Failing Test

The goal is to write a test that fails for the RIGHT reason (missing logic, not compilation errors).

### Steps

1. **Write the test codeunit** following the spec and assigned test scenarios
2. **Stub external services only** — an external (HTTP) dependency gets a stub behind its interface; do not add interfaces or mock repositories for internal codeunits
3. **Create MINIMAL production code stubs** — enough to compile, but NO actual logic
   - Procedures return default values (0, '', false)
   - No business rules, no calculations, no validations
4. **Compile:**
   ```bash
   <project build route>
   ```
5. **Publish:**
   ```bash
   <project publish route>   # e.g. /publish (bc-publish), when installed
   ```
6. **Run the test:**
   ```bash
   <project test route> -o .dev/<task-slug>/test-results-red.txt   # e.g. /run-tests (bc-test), when installed
   ```
7. **HARD STOP** — Use AskUserQuestion:

   > **RED Phase Complete**
   >
   > Test **FAILED** as expected.
   > Results saved to `.dev/<task-slug>/test-results-red.txt`
   >
   > - **Approve** — Test failed correctly, proceed to GREEN phase
   > - **Test PASSED unexpectedly** — TDD VIOLATION, investigate
   > - **Need troubleshooting** — Help me debug

8. **If the test PASSED in RED phase: STOP IMMEDIATELY.**
   This is a TDD violation. The test is either:
   - Testing something already implemented (not a new behavior)
   - Not actually asserting the right thing
   - Using wrong expectations

   Do NOT proceed to GREEN. Investigate and fix the test first.

---

## Phase 2: GREEN — Make It Pass

The goal is to write the MINIMUM production code that makes the test pass. No more, no less.

### Steps

1. **Implement ACTUAL production logic** — replace the stubs from RED phase with real code
2. **Implement real interface implementations** (replace mocks with production code where appropriate)
3. **Compile, publish, and run the test:**
   ```bash
   <project build route> && <project publish route> && <project test route> -o .dev/<task-slug>/test-results-green.txt
   ```
4. **HARD STOP** — Use AskUserQuestion:

   > **GREEN Phase Complete**
   >
   > Test **PASSED**.
   > Results saved to `.dev/<task-slug>/test-results-green.txt`
   >
   > - **Approve** — Test passes correctly, proceed to REFACTOR phase
   > - **Test still FAILS** — Need to iterate on implementation
   > - **Need troubleshooting** — Help me debug

5. **If the test still fails:** iterate on the implementation until it passes. Do NOT move to REFACTOR until GREEN.

---

## Phase 3: REFACTOR — Improve Quality

The goal is to improve code quality WITHOUT changing behavior. All tests must continue to pass.

### Steps

1. **Refactor production code:**
   - Extract helper procedures
   - Improve variable and procedure names
   - Add XML documentation comments
   - Optimize performance (remove redundant calls, simplify logic)
   - Apply DRY (Don't Repeat Yourself)
   - Improve readability

2. **Refactor test code:**
   - Extract shared setup into helper procedures
   - Improve test names if needed
   - Add or improve assertion messages

3. **Do NOT change behavior** — no new features, no new edge cases, no bug fixes

4. **Compile, publish, and run ALL tests** (not just the current one):
   ```bash
   <project build route> && <project publish route> && <project test route> -o .dev/<task-slug>/test-results-refactor.txt
   ```

5. **HARD STOP** — Use AskUserQuestion:

   > **REFACTOR Phase Complete**
   >
   > All tests **PASS**.
   > Results saved to `.dev/<task-slug>/test-results-refactor.txt`
   >
   > - **Approve** — Refactoring looks good, start next TDD cycle
   > - **Some tests FAILED** — Revert refactoring immediately
   > - **Need troubleshooting** — Help me debug

6. **If tests broke during refactoring:** revert ALL refactoring changes immediately. The refactoring introduced a behavior change, which is not allowed.

---

## TDD Log Documentation

Maintain `.dev/<task-slug>/03-tdd-log.md` throughout the TDD process. Update it after each phase completion.

### Format

```markdown
# TDD Log — <Task Name>

## Cycle 1: <Feature/Behavior Name>

### RED Phase
- **Test:** `<TestProcedureName>`
- **Test Codeunit:** `<ID> "<Name>"`
- **Status:** FAILED (as expected)
- **Error:** `<The assertion/error message>`
- **Stubs created:** `<List of stub procedures>`

### GREEN Phase
- **Production code:** `<Files modified>`
- **Logic implemented:** `<Brief description>`
- **Test status:** PASSED
- **All tests status:** X/X passing

### REFACTOR Phase
- **Improvements:** `<What was refactored>`
- **All tests status:** X/X passing

---

## Cycle 2: <Feature/Behavior Name>
...
```

---

## Summary of Hard Stops

Every TDD cycle has **exactly 3 hard stops** where user approval is required:

| Phase | Gate | Expected State | Action if Unexpected |
|-------|------|---------------|---------------------|
| RED | After test run | Test FAILS | If PASSES: TDD violation, stop and investigate |
| GREEN | After implementation | Test PASSES | If FAILS: iterate implementation, do not skip |
| REFACTOR | After cleanup | ALL tests PASS | If any FAIL: revert refactoring immediately |

**Three hard stops per test. No exceptions.**

---

## When to Use TDD vs. Standard Testing

| Approach | When to Use |
|----------|------------|
| **TDD (this protocol)** | New features, complex business logic, critical calculations, when user explicitly requests TDD |
| **Standard testing (`/test` skill)** | Existing code that needs test coverage, bulk test creation, when speed is more important than TDD discipline |

The `/test` skill can operate in either mode. TDD mode is activated when the user requests it or when the develop skill triggers test-first development.
