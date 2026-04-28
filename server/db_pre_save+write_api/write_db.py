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

    updated_objects = []

    # iterate over the objects and count how many were inserted/updated
    for obj in objects:

        if not isinstance(obj, dict):
            continue

        # get the "titel" from the object,
        # if it is set create a new linked object with the same name.
        # insert the object over the api and link it in this object
        objecttype = util.get_json_value(obj, '_objecttype')
        title = util.get_json_value(obj, f'{objecttype}.titel')
        if not title:
            continue

        # create a new "linked_object" payload
        # and post it to the api/v1/db endpoint
        resp_text, statuscode = util.post_to_api(
            api_url=api_url,
            path='db/linked_object',
            access_token=access_token,
            payload=json.dumps(
                [
                    {
                        '_comment': '<inserted by fylr-plugin-example>',
                        '_mask': "_all_fields",
                        '_objecttype': "linked_object",
                        "linked_object": {
                            "_version": 1,
                            "name": title,
                        },
                    }
                ],
                indent=4,
            ),
        )
        if statuscode != 200:
            # could not insert the new linked object -> api error
            util.return_error_response(
                f'could not insert linked_object: api error (code {statuscode}): {resp_text}'
            )

        # use a lookup to insert the new linked object
        obj[objecttype]['link'] = {
            '_mask': "_all_fields",
            '_objecttype': "linked_object",
            "linked_object": {
                "_version": 1,
                "lookup:_id": {
                    "name": title,
                },
            },
        }

        # this object was updated, it must be returned to fylr
        updated_objects.append(obj)

    # only return the objects which were updated.
    # fylr will save all other objects from the callback without any changes
    util.return_response({"objects": updated_objects})


if __name__ == '__main__':
    main()
