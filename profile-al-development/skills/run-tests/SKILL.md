---
name: run-tests
description: Execute AL test codeunits. Use al-runner for fast pure-logic tests (no BC required). Use bc-test for full integration tests against a running BC instance.
disable-model-invocation: true
---

# /run-tests — Execute AL Tests

## Two Test Runners

| Tool | When to use | BC required? | Speed |
|------|------------|-------------|-------|
| `al-runner` | Pure-logic unit tests (in-memory tables, no pages/HTTP/events) | No | Milliseconds |
| `bc-test` | Full integration tests against a running BC instance | Yes | Seconds–minutes |

## al-runner (preferred for unit tests)

**Full AI agent guide:**
```bash
al-runner --guide
```

**Basic usage:**
```bash
# Run all tests
al-runner ./src ./test

# With symbol packages
al-runner --packages .alpackages ./src ./test

# With stubs for unsupported dependencies
al-runner --packages .alpackages --stubs ./stubs ./src ./test

# Run a single test procedure
al-runner --run TestMyProcedure ./src ./test

# With coverage report
al-runner --coverage ./src ./test

# Machine-readable JSON output
al-runner --output-json ./src ./test

# JUnit XML for CI
al-runner --output-junit results.xml ./src ./test
```

**Exit codes:**
| Code | Meaning |
|------|---------|
| 0 | All tests passed |
| 1 | Real assertion failures |
| 2 | Runner limitations only (compilation gaps, missing mocks — not real failures) |
| 3 | AL compilation error |

Use exit code 2 to distinguish runner gaps from real failures in CI.

**What al-runner supports:** in-memory tables, CRUD, filters, cross-codeunit calls, interfaces, asserterror, JSON types, BLOB/InStream/OutStream, RecordRef/FieldRef, IsolatedStorage, TextBuilder, and more. See `al-runner --guide` for the full list.

**What al-runner does NOT support:** Pages, Reports, XMLports, HTTP calls, event subscribers. Inject these via AL interfaces or use `--stubs`.

## bc-test (full BC integration)

Expects `bc-test` on PATH (from bc-linux or bc-tools).

```bash
bc-test --help
```

Use when tests require BC's service tier, events, UI flows, or features not supported by al-runner.

## Behavior

1. Determine which runner is appropriate for the test type
2. Parse `$ARGUMENTS` and pass through to the selected tool
3. If there's an active task folder (`.dev/<task-slug>/`), capture output to `.dev/<task-slug>/test-results.txt`

## Handling Results

- **All passing (al-runner exit 0):** Report pass count. Note "Tests green."
- **Exit 2 (al-runner):** Runner limitations only. Not a real failure — add stubs or use bc-test for the blocked tests.
- **Real failures:** List each failed test with codeunit, method name, and error message. Offer to analyze and suggest fixes.
- **No tests found:** Check that test codeunits use `Subtype = Test` and mark procedures with `[Test]`.
