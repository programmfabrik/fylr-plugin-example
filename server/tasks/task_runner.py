#!/usr/bin/env python3
import sys
import json

# This is a sample task runner for a plugin task module.
# It reads the task configuration from stdin, logs the message the specified number of times, and returns the logs.

def main():
    input_data = sys.stdin.read()

    try:
        data = json.loads(input_data)
    except json.JSONDecodeError:
        print(json.dumps({
            "error": "Invalid JSON input"
        }))
        sys.exit(1)

    task = data.get("task", {})
    config = task.get("config", {})

    message = config.get("message", "Hello from plugin fylr_example")
    count = config.get("count", 1)

    logs = []

    for i in range(count):
        logs.append({
            "level": "info",
            "msg": f"{message} (iteration {i+1}/{count})"
        })

    logs.append({
        "level": "info",
        "msg": f"Task completed successfully. Task ID: {task.get('task_id')}"
    })

    response = {
        "logs": logs
    }

    print(json.dumps(response))
    sys.exit(0)

if __name__ == "__main__":
    main()