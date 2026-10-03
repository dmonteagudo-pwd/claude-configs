---
description: AL data access and error handling patterns
globs: ["**/*.al"]
---

# AL Data Access Rules

> Rules from a project overlay plugin (for example `profile-bc-prodware/rules/`) prevail over this file in any conflict.

## Before Any Data Access

Before every record retrieval operation (`Get`, `FindFirst`, `FindLast`, `FindSet`), decide both:

1. **`SetLoadFields`** — on read paths, load only the fields you will actually use; reading a full record to access one field is a defect. Do not use it on a record that will be inserted, deleted, renamed, used in `TransferFields` or copied to a temporary record: those operations need every field, so the platform does a JIT load that costs more than the partial read saves.
2. **`ReadIsolation`** — decide the isolation level before the read, and set it only when the default is wrong. For ordinary reads, leave the default: the runtime chooses the level per table, and tri-state locking (always on from v26) reads with `ReadCommitted` after writes. Raise it with `Rec.ReadIsolation := IsolationLevel::UpdLock` when the read decides a write (read-then-modify, next entry number, balance or stock check). Lower it with `IsolationLevel::ReadUncommitted` only where a dirty read is acceptable (estimated counts, cues, dashboards), never when the result drives a write, a validation or a posting.

## FlowFields

Prefer `SetAutoCalcFields` before retrieval when you need FlowField values — it calculates them in the same SQL operation, avoiding extra round trips.

Use `CalcFields` only when you already have the record in memory and need to (re-)calculate a specific FlowField outside of a retrieval operation.

## Error Messages

- Use `ErrorInfo` to construct error messages — it allows actions, URLs, and structured context that plain `Error()` cannot provide.
- Use `FieldCaption` (not hardcoded field names) so errors respect translations.
- Define error text as a `Label` constant with a `Comment` documenting `%1`/`%2` substitutions.
- Every error message must be actionable — state what went wrong AND what the user should do.

## Integration Events

Raise `[IntegrationEvent(false, false)]` events at meaningful extension points — typically `OnBefore...` and `OnAfter...` around the core operation. Keep the event procedure body empty.
