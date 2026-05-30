import sys
import json
import re
import subprocess

try:
    data = json.load(sys.stdin)
    file_path = data.get("tool_input", {}).get("file_path", "")
    if re.search(r"\.(tsx?|ts)$", file_path):
        result = subprocess.run(
            ["npx", "tsc", "--noEmit", "--skipLibCheck"],
            cwd="C:/Users/Administrateur/DESKTOP/SITES/frontend",
            capture_output=True,
            text=True,
            timeout=60
        )
        if result.returncode != 0:
            errors = "\n".join(result.stdout.splitlines()[:15])
            output = {
                "hookSpecificOutput": {
                    "hookEventName": "PostToolUse",
                    "additionalContext": f"TypeScript errors detectes:\n{errors}"
                }
            }
            print(json.dumps(output))
except Exception:
    pass
