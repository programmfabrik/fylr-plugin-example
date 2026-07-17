# encoding: utf-8

# Like write_db.py, but the api calls go to info.api_tx_url (fylr #80077):
# the endpoint under which the plugin joins the SAVING REQUEST'S OPEN WRITE
# TRANSACTION. The inserted linked object is uncommitted until the save
# commits - reading it back over the same url proves the plugin sees the
# transaction's state. Works on SQLite too, where a write over the regular
# api url would collide with the open transaction.

import sys
import json
import util


def main():

    # read the callback data from fylr
    callback_data = json.loads(sys.stdin.read())

    # the transaction-joined api url; only the tokens of THIS callback work here
    api_tx_url = util.get_json_value(callback_data, 'info.api_tx_url')
    if not api_tx_url:
        util.return_error_response('info.api_tx_url missing!')

    # get the oauth2 access token for the api
    access_token = util.get_access_token(callback_data)

    objects = util.get_json_value(callback_data, 'objects')
    if not isinstance(objects, list):
        util.return_response(callback_data)

    updated_objects = []

    for obj in objects:

        if not isinstance(obj, dict):
            continue

        # get the "titel" from the object,
        # if it is set create a new linked object with the same name,
        # inserted INTO the open transaction of this save
        objecttype = util.get_json_value(obj, '_objecttype')
        title = util.get_json_value(obj, f'{objecttype}.titel')
        if not title:
            continue

        resp_text, statuscode = util.post_to_api(
            api_url=api_tx_url,
            path='db/linked_object',
            access_token=access_token,
            payload=json.dumps(
                [
                    {
                        '_comment': '<inserted by fylr-plugin-example (tx)>',
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
            util.return_error_response(
                f'could not insert linked_object over api_tx_url: api error (code {statuscode}): {resp_text}'
            )

        # read the uncommitted object back over the transaction url
        inserted = json.loads(resp_text)
        obj_id = util.get_json_value(inserted[0], 'linked_object._id')
        resp_text, statuscode = util.get_from_api(
            api_url=api_tx_url,
            path=f'db/linked_object/_all_fields/{obj_id}',
            access_token=access_token,
        )
        if statuscode != 200:
            util.return_error_response(
                f'could not read linked_object {obj_id} back over api_tx_url (code {statuscode}): {resp_text}'
            )

        # use a lookup to link the new object; it resolves inside the same
        # transaction
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

        updated_objects.append(obj)

    # only return the objects which were updated.
    # fylr will save all other objects from the callback without any changes
    util.return_response({"objects": updated_objects})


if __name__ == '__main__':
    main()
