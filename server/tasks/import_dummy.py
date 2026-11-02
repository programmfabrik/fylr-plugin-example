"""Task module "import_dummy", kind "custom": imports the records of a dummy
external source (dummy_source.json) as objects, through the API as the task
owner. The task state remembers the last record imported, so that the next
run imports the records after it. "delay" waits after each record, to watch
the log of a running task."""

import json
import os
import time

from task_util import api, out, read_input

info = read_input()["info"]
task = info["task"]
params = task["params"]
objecttype = params["objecttype"]
field = params["field"]
count = params.get("count") or 3
delay = params.get("delay") or 0
last_id = (task.get("state") or {}).get("last_id", 0)

with open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "dummy_source.json")) as f:
    records = json.load(f)

todo = [rec for rec in records if rec["id"] > last_id][:count]
if not todo:
    out(msg="no record after record %d in the source" % last_id, status_percent=100)

for idx, rec in enumerate(todo):
    obj = {
        "_objecttype": objecttype,
        "_mask": "_all_fields",
        objecttype: {"_version": 1, field: rec["title"]},
    }
    status, answer = api(info, "POST", "/api/v1/db/" + objecttype, [obj])
    if status != 200:
        # the run fails with this message
        out(error="record %d: HTTP %d: %s" % (rec["id"], status, answer))
        break
    # the new task state, fylr stores it at once
    out(state={"last_id": rec["id"]})
    out(
        msg="record %d imported as obj #%d" % (rec["id"], answer[0]["_system_object_id"]),
        status_percent=int((idx + 1) * 100 / len(todo)),
    )
    time.sleep(delay)
