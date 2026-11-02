"""Task module "export_search", kind "custom": runs the search of the task as
the task owner and posts the objects it finds to an endpoint. An endpoint that
starts with "/" is a path of the fylr API, which gets the access token of the
task owner; an external endpoint never gets it."""

from task_util import api, http, out, read_input

info = read_input()["info"]
task = info["task"]
params = task["params"]

search = dict(params["search"])
if search.pop("incremental", False) and task.get("last_run_at"):
    search.setdefault("search", []).append(
        {"type": "range", "field": "_last_modified", "from": task["last_run_at"]}
    )
search["format"] = "long"
search["limit"] = 100
search["offset"] = 0

objects = []
while True:
    status, answer = api(info, "POST", "/api/v1/search", search)
    if status != 200:
        out(error="search: HTTP %d: %s" % (status, answer))
        raise SystemExit
    objects += answer["objects"]
    if len(answer["objects"]) < search["limit"]:
        break
    search["offset"] += search["limit"]
out(msg="found %d objects" % len(objects), status_percent=50)

endpoint = params["endpoint"]
if endpoint.startswith("/"):
    status, answer = api(info, "POST", endpoint, {"objects": objects})
else:
    status, answer = http("POST", endpoint, {"objects": objects})
if status != 200:
    out(error="%s: HTTP %d: %s" % (endpoint, status, answer))
else:
    out(msg="exported %d objects to %s: HTTP %d" % (len(objects), endpoint, status), status_percent=100)
