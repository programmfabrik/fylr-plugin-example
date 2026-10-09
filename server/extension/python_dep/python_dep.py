# An extension that depends on Python packages (#81675). build.yml lists them
# under server.python for this folder: the build resolves them for the fylr
# image and delivers them, dependencies included, next to this file, which is
# where Python looks first. Nothing is installed on the instance.
#
# - python-slugify is listed; text-unidecode, which it needs, is not and ships
#   anyway
# - trimesh is pure Python and ships; numpy, which it needs, is compiled and
#   comes from the fylr image
import json
import os
import sys

import numpy
import slugify
import trimesh

here = os.path.dirname(os.path.abspath(__file__))


def shipped(module):
    """whether module was imported from the plugin, not from the image"""
    return os.path.abspath(module.__file__).startswith(here + os.sep)


# %info.json% is passed as the first argument: fylr config + call context,
# including the request's query parameters
info = json.loads(sys.argv[1])
query = (info.get("request") or {}).get("query") or {}
text = (query.get("text") or ["Grüße aus Köln"])[0]

box = trimesh.creation.box(extents=[1, 2, 3])

print(json.dumps({
    "slug": slugify.slugify(text),
    # computed by trimesh with numpy, not echoed back
    "volume": round(float(box.volume), 6),
    "area": round(float(box.area), 6),
    "shipped": {
        "slugify": shipped(slugify),
        "trimesh": shipped(trimesh),
        "numpy": shipped(numpy),
    },
}))
