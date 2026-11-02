"""The check of the task module examples. fylr calls it when a task is saved,
with the params fylr has checked already (types, mandatory params, select
options). It answers {"errors": [{"param": ..., "msg": ...}]}, an empty list
accepts the params."""

import json

from task_util import read_input

task = read_input()["info"]["task"]
module = task["task_module"].split(".", 1)[1]
params = task["params"]

errors = []
if module == "import_dummy":
    count = params.get("count")
    if count is not None and not 1 <= count <= 100:
        errors.append({"param": "count", "msg": "must be between 1 and 100"})
elif module == "export_search":
    endpoint = params.get("endpoint") or ""
    if not endpoint.startswith(("http://", "https://", "/")):
        errors.append({"param": "endpoint", "msg": "must be an http(s) URL or a path of the fylr API"})
elif module == "set_field":
    if (params.get("field") or "").startswith("_"):
        errors.append({"param": "field", "msg": "a system field cannot be set"})

print(json.dumps({"errors": errors}))
