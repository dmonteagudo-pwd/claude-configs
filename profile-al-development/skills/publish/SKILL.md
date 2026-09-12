---
name: publish
description: Deploy the compiled AL app to a Business Central server using bc-publish. Requires .bcconfig.json configuration.
---

# /publish — Deploy to BC Server

## Tool Reference

```
!bc-publish --help
```

## Behavior

1. Check prerequisites: `.app` file exists (if not, suggest the project's build route — `/al-compile` under `profile-bc-prodware`; see the `build-tools` skill), `.bcconfig.json` exists (suggest `bc-publish --init` if not)
2. Parse `$ARGUMENTS` and pass through to `bc-publish`
3. Run `bc-publish`

## Handling Results

- **Success:** Report server/instance. Suggest `/run-tests` as next step.
- **Connection failure:** Show connection details from `.bcconfig.json`, suggest checking BC service status.
- **Schema conflict:** Suggest setting `"schemaUpdateMode": "synchronize"` in `.bcconfig.json`.
