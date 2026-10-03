---
description: AL object architecture and testability rules
globs: ["**/*.al"]
---

# AL Architecture Rules

> Rules from a project overlay plugin (for example `profile-bc-prodware/rules/`) prevail over this file in any conflict.

## Layer Responsibilities

**Pages and PageExtensions** — UI and UI control only.
- Acceptable: calling out to a codeunit, setting filters, navigating, visibility expressions, style expressions, and other logic that directly controls what the user sees or how the UI behaves.
- Not acceptable: business logic, calculations, domain rules, or direct table writes.

**Tables** — data structure and record-level entry points.
- Field definitions, keys, FlowFields, field-level validation (format, range checks).
- Table triggers may call a procedure defined on the same table to act on the current record — this is a valid pattern for keeping record-centric operations close to the data. The procedure itself should be thin and delegate to a codeunit for any real logic.
- No cross-table orchestration from table triggers.

**Codeunits** — own all business logic and orchestration.
- One codeunit = one domain responsibility.
- Codeunits may call other codeunits.
- Codeunits generally do not open pages. The exception is codeunits whose explicit responsibility is UI routing — opening, redirecting, or conditionally navigating to pages. This is a narrow exception, not a general pattern.

**Reports and XMLports** — data projection only.
- Format and extract data. No business rule enforcement.

## Testability and Dependency Injection

Code must be testable, at the depth the solution needs. Tests reach impure dependencies (database, date/time, external services, user input) through a seam: a point where behavior can be changed without modifying the code under test.

**When to define an interface**:
- An external service (HTTP or any other integration outside BC) always sits behind an interface, so tests can replace it.
- Otherwise, define an interface only when the design has two or more real implementations of one contract (carrier integrations, payment providers, interchangeable strategies), or when it breaks a dependency the architecture rules forbid.
- One implementation and no stated second one means no interface. Never define an interface, publish an event or add a setup field whose only consumer is a hypothetical future requirement.

**Resolving an interface**:
- For simple cases, an overloaded procedure is sufficient: one overload takes the interface as a parameter, the other calls the first with the default implementation. No factory needed.
- Use a factory codeunit when the resolution is non-trivial, shared across callers, or must be swappable at a higher level (e.g. test setup registers a mock once for the whole test). Factories are a tool, not a requirement everywhere.
- Test code substitutes the real implementation through that injection point.

If you find yourself writing `if Environment = 'TEST' then` inside business logic, that is a missing seam: add one at the dependency that forces it.
