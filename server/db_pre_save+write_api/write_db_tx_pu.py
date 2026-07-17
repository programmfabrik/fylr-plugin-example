# encoding: utf-8

# Like write_db_tx.py, but authenticates with the PLUGIN_USER token (fylr
# #80077): the api_tx_url lease accepts exactly the tokens handed to this
# callback - the acting user's AND the configured plugin_user's. The insert
# below runs as the plugin_user inside the saving request's open write
# transaction, so the created object's owner is the plugin_user.

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

    # the configured plugin_user's token; the write below runs as that user
    access_token = util.get_json_value(callback_data, 'info.plugin_user_access_token')
    if not access_token:
        util.return_error_response('info.plugin_user_access_token missing!')
    if not util.get_json_value(callback_data, 'info.plugin_user'):
        util.return_error_response('info.plugin_user missing!')

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
                        '_comment': '<inserted by fylr-plugin-example (tx pu)>',
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
