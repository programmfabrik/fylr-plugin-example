# encoding: utf-8


import sys
import json
import util


def main():

    # read the callback data from fylr
    callback_data = json.loads(sys.stdin.read())

    # get the server api url and access token
    api_url = util.get_api_url(callback_data)

    # get the oauth2 access token for the api
    access_token = util.get_access_token(callback_data)

    objects = util.get_json_value(callback_data, 'objects')
    if not isinstance(objects, list):
        util.return_response(callback_data)

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

        version = util.get_json_value(obj, f'{objecttype}._version')
        if version == 1:
            objecttype_count[objecttype]['inserted'] += 1
        else:
            objecttype_count[objecttype]['updated'] += 1

    # write events
    for objecttype in objecttype_count:
        util.post_to_api(
            api_url=api_url,
            path='event?background=1',
            access_token=access_token,
            payload=json.dumps(
                {
                    'event': {
                        'type': 'EXAMPLE_PLUGIN_OBJECT_STATISTICS',
                        'objecttype': objecttype,
                        'info': objecttype_count[objecttype],
                    }
                },
                indent=4,
            ),
        )

    # return an empty objects array, this indicates to fylr that there were no changes in the objects
    util.return_response({"objects": []})


if __name__ == '__main__':
    main()
