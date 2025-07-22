import json, sys, requests

parm = json.loads(sys.argv[1])
out = {
    "api_user": parm["api_user"],
    "api_user_access_token": parm["api_user_access_token"],
}

if "plugin_user_access_token" in parm:
    out["plugin_user_access_token"] = parm["plugin_user_access_token"]
    out["plugin_user"] = parm["plugin_user"]

    # get plugin/manage (needs system right)
    response = requests.get(parm["api_url"]+"/api/v1/plugin/manage", headers={
        "Authorization": "Bearer "+out["plugin_user_access_token"]
    })
    out["plugin_status_code"] = response.status_code

print(json.dumps(out, indent = 2))
sys.exit(0)
