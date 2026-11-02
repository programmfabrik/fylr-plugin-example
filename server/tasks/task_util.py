"""Helpers the task module examples share."""

import json
import sys
import urllib.error
import urllib.request


def read_input():
    """The JSON fylr writes to stdin: {"info": {...}} and, for a module of
    kind "search", "objects": the objects of one page."""
    return json.load(sys.stdin)


def out(**line):
    """Writes one line of output. fylr reads stdout line by line (NDJSON) and
    puts each line into the task log as it arrives, so flush every line."""
    print(json.dumps(line), flush=True)


def http(method, url, body=None, token=None):
    """Returns (HTTP status, answer). The answer is parsed JSON if it is
    JSON, else text."""
    data = None if body is None else json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", "Bearer " + token)
    try:
        with urllib.request.urlopen(req, timeout=60) as res:
            status, raw = res.status, res.read()
    except urllib.error.HTTPError as e:
        status, raw = e.code, e.read()
    try:
        return status, json.loads(raw)
    except ValueError:
        return status, raw.decode(errors="replace")[:1000]


def api(info, method, path, body=None):
    """Calls the fylr API as the task owner."""
    return http(method, info["api_url"] + path, body, info["api_user_access_token"])
