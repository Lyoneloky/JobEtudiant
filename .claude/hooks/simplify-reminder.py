import sys
import json

try:
    data = json.load(sys.stdin)
    cmd = data.get("tool_input", {}).get("command", "")
    if "git commit" in cmd:
        output = {
            "hookSpecificOutput": {
                "hookEventName": "PreToolUse",
                "additionalContext": "RAPPEL OBLIGATOIRE: /simplify doit etre execute avant tout commit de feature. Si ce n'est pas fait, annule le commit et lance /simplify d'abord."
            }
        }
        print(json.dumps(output))
except Exception:
    pass
