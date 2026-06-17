#!/usr/bin/env bash
# PostToolUse hook: records AL project roots when .al files are edited
# Reads tool call info from stdin as JSON, writes project root to queue file

set -euo pipefail

INPUT=$(cat)

parse_json() {
    python3 -c "import sys,json; d=json.loads(sys.argv[1]); print(d.get('$1') or '')" "$INPUT" 2>/dev/null || true
}

SESSION_ID=$(python3 -c "import sys,json; d=json.loads(sys.argv[1]); print(d.get('session_id') or '')" "$INPUT" 2>/dev/null || true)
QUEUE_FILE="/tmp/al-compile-queue-${USER:-${USERNAME:-unknown}}-${SESSION_ID:-default}"

FILE_PATH=$(python3 -c "import sys,json; d=json.loads(sys.argv[1]); print((d.get('tool_input') or {}).get('file_path') or '')" "$INPUT" 2>/dev/null || true)

[[ -z "$FILE_PATH" ]] && exit 0
[[ "$FILE_PATH" != *.al ]] && exit 0
[[ ! -e "$FILE_PATH" ]] && exit 0

# Walk up from file to find app.json
DIR=$(dirname "$(realpath "$FILE_PATH")")
while [[ "$DIR" != "/" ]]; do
    if [[ -f "$DIR/app.json" ]]; then
        echo "$DIR" >> "$QUEUE_FILE"
        exit 0
    fi
    DIR=$(dirname "$DIR")
done

exit 0
