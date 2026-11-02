"""Task module "set_field", kind "search": fylr runs the search of the task
and calls this once per page of objects. It sets a field of each object and
answers for each object; fylr saves the objects as the task owner and sets the
tags of the task. An object whose field has a value keeps it unless
"overwrite" is set, and counts as failed."""

from task_util import out, read_input

inp = read_input()
params = inp["info"]["task"]["params"]
field = params["field"]
value = params.get("value") or ""
overwrite = params.get("overwrite") or False

out(level="debug", msg="page of %d objects" % len(inp["objects"]))

for obj in inp["objects"]:
    sid = obj["_system_object_id"]
    data = obj[obj["_objecttype"]]
    current = data.get(field)
    if current == value:
        out(_system_object_id=sid, msg="%s is %r already" % (field, value))
    elif current and not overwrite:
        out(_system_object_id=sid, status="error", level="warning", msg="%s has the value %r, not overwritten" % (field, current))
    else:
        data[field] = value
        out(_system_object_id=sid, object=obj, msg="set %s to %r" % (field, value))
