#!/usr/bin/env bash
# Stop hook: compiles all AL projects touched in this turn
# Reads project roots from queue file, runs al-compile for each, feeds errors back

set -uo pipefail

INPUT=$(cat)
SESSION_ID=$(python3 -c "import sys,json; d=json.loads(sys.argv[1]); print(d.get('session_id') or '')" "$INPUT" 2>/dev/null || true)
QUEUE_FILE="/tmp/al-compile-queue-${USER:-${USERNAME:-unknown}}-${SESSION_ID:-default}"

[[ ! -f "$QUEUE_FILE" ]] && exit 0

command -v al-compile >/dev/null 2>&1 || { rm -f "$QUEUE_FILE"; exit 0; }

# Deduplicate project roots
PROJECTS=$(sort -u "$QUEUE_FILE")
rm -f "$QUEUE_FILE"

[[ -z "$PROJECTS" ]] && exit 0

HAD_ERRORS=0

while IFS= read -r PROJECT_DIR; do
    [[ -z "$PROJECT_DIR" ]] && continue
    [[ ! -d "$PROJECT_DIR" ]] && continue

    PROJECT_NAME=$(python3 -c "import sys,json; d=json.load(open(sys.argv[1])); print(d.get('name','unknown'))" "$PROJECT_DIR/app.json" 2>/dev/null || echo "unknown")

    # al-compile --quiet writes nothing on success, and a clean error list to
    # stderr on failure. Capture stderr; let exit code drive the branching.
    COMPILE_ERR=$(cd "$PROJECT_DIR" && al-compile --quiet 2>&1 1>/dev/null)
    COMPILE_RC=$?
    if [[ $COMPILE_RC -eq 0 ]]; then
        echo "AL compilation OK: $PROJECT_NAME"
    else
        HAD_ERRORS=1
        {
            echo "AL compilation FAILED: $PROJECT_NAME"
            echo "$COMPILE_ERR"
            echo ""
            echo "Fix the above compilation errors."
        } >&2
    fi

done <<< "$PROJECTS"

# Exit 2 = rewake Claude with the output so it fixes errors
# Exit 0 = clean compile, Claude stops normally
[[ $HAD_ERRORS -eq 1 ]] && exit 2
exit 0
