# encoding: utf-8


import sys
import json
import util


def main():

    orig_data = json.loads(sys.stdin.read())

    # get the server url
    api_url = util.get_json_value(orig_data, 'info.api_url')
    if api_url is None:
        util.return_error_response('info.api_url missing!')
    api_url += '/api/v1'

    # get a session token
    access_token = util.get_json_value(
        orig_data, 'info.api_user_access_token')
    if access_token is None:
        util.return_error_response('info.api_user_access_token missing!')

    objects = util.get_json_value(orig_data, 'objects')
    if not isinstance(objects, list):
        util.return_response(orig_data)

    objecttype_count = {}

    # iterate over the objects and count how many were inserted/updated
    for obj in objects:

        if not isinstance(obj, dict):
            continue

        objecttype = util.get_json_value(obj, '_objecttype')

        if not objecttype in objecttype_count:
            objecttype_count[objecttype] = {
                'inserted': 0,
                'updated': 0,
            }

        version = util.get_json_value(obj, objecttype + '._version')
        if version == 1:
            objecttype_count[objecttype]['inserted'] += 1
        else:
            objecttype_count[objecttype]['updated'] += 1

    # write events
    for objecttype in objecttype_count:
        util.post_to_api(
            api_url=api_url,
            path='event',
            access_token=access_token,
            payload=util.dumpjs({
                'event': {
                    'type': 'EXAMPLE_PLUGIN_OBJECT_STATISTICS',
                    'objecttype': objecttype,
                    'info': objecttype_count[objecttype]
                }
            })
        )

    util.return_response({"objects": []})


if __name__ == '__main__':
    main()
