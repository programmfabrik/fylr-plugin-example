import json

import sys
import json


def respond():
    response_json = json.dumps({
        "status_code": 200,
        "body": {
            "log": ["log entry 1", "log entry 2"]
        }
    }, indent=4)
    print(response_json)


def main():
    # Check if at least one argument is provided
    if len(sys.argv) < 2:
        print("Usage: example.py <json_string>")
        sys.exit(1)

    # Read the first command-line argument
    json_string = sys.argv[1]

    try:
        # Parse the JSON string
        data = json.loads(json_string)
        print("Parsed JSON data:", file=sys.stderr)
        print(data, file=sys.stderr)
    except json.JSONDecodeError as e:
        print(f"Invalid JSON: {e}", file=sys.stderr)
        sys.exit(1)

    respond()

if __name__ == "__main__":
    main()

