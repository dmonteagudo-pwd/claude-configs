---
description: AL naming conventions, namespaces, and affix rules
globs: ["**/*.al"]
---

# AL Naming Rules

> 🚨 **PRODWARE WORKSPACE OVERRIDE:** If `profile-bc-prodware` is active or working in a Prodware workspace, this entire file is **FULLY SUPPRESSED**. Do NOT apply these rules. Follow `rules/pwe-architecture.md` §2 and `rules/pwe-coding-guidelines.md` instead (Prodware mandates CRS prefixes on objects and extension fields).

## PascalCase Everywhere

PascalCase for ALL identifiers — objects, variables, fields, procedures, parameters, properties. No exceptions. No spaces or special characters in any identifier name.

## Namespaces

Always use a minimum two-level namespace. The registered AppSource affix forms the root, with at least one further segment beneath it — e.g. `namespace ABC.Sales;`, `namespace ABC.Core;`, `namespace ABC.Sales.Documents;`.

A two-level (or deeper) namespace provides full uniqueness. Object names do NOT carry the affix when this condition is met. The registered affix is defined in `AppSourceCop.json`.

**Let AppSourceCop be the authority.** If AppSourceCop is configured (which it should be) and does not complain about a missing affix, the affix is not required. If it complains, add it. Do not add affixes preemptively when the namespace already satisfies the requirement.

## Affix Rules for Extension Fields

Object names never carry the affix (namespace handles it). Extension fields on base-app or third-party tables are different — they require a **suffix** affix:

| Context | Object Name Affix | Field Name Affix |
|---|---|---|
| Custom table | No | No |
| Table extension | No | **Suffix only** |
| Custom page / page extension | No | N/A |
| Codeunit / Enum / Interface | No | N/A |
| Enum extension | No | **Suffix only** |

- **Never use prefix affixes on extension fields.** `"Loyalty Tier ABC"` — correct. `"ABC Loyalty Tier"` — wrong.
