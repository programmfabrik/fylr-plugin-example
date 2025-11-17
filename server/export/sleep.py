import sys
import json
import time

def main():
    # Check if enough arguments are provided
    if len(sys.argv) < 2:
        print(f'Wrong number of parameters. Usage: "python3 export_demo.py <info>"', file=sys.stderr)
        sys.exit(1)

    # Parse the JSON string passed as the second argument (sys.argv[1])
    info_json_str = sys.argv[1]

    try:
        info = json.loads(info_json_str)
    except json.JSONDecodeError as e:
        print(f"Unable to parse argument <info>: {e}", file=sys.stderr)
        sys.exit(1)

    sec = float(info["export"]["export"]["produce_options"].get("seconds", 1))
    # print(f"Sleeping {sec} seconds")
    time.sleep(sec)

    info["export"]["_plugin_log"] = [
        f"sleeping for {sec}...",
        f"slept for {sec}."
    ]

    # Mark export as done and clean up log
    info["export"]["_state"] = "done"
    info["export"].pop("_log", None)  # Remove _log if it exists

    # Output the modified export object as pretty-printed JSON
    print(json.dumps(info["export"], indent=2))

if __name__ == "__main__":
    main()