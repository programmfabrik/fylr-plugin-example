# encoding: utf-8

# token_check: db_pre_save / transition_db_pre_save callback used by the fylr
# apitests for ticket #79926 (session binding broke server-side plugin callbacks).
#
# It calls back into the API exactly like a real plugin (e.g. fylr-plugin-sequence)
# does, using the api_user_access_token fylr handed it. If that token is rejected
# server-side (the #79926 regression: a browser-bound token replayed without the
# cookie -> session-binding 401), the callback fails the save / transition. With
# an unbound token (API client, or after the fix) it succeeds and changes nothing.

import sys
import json
import util
import requests


def main():
    callback_data = json.loads(sys.stdin.read())
    api_url = util.get_api_url(callback_data)
    access_token = util.get_access_token(callback_data)

    resp = requests.get(
        f'{api_url}/user/session',
        headers={'Authorization': f'Bearer {access_token}'},
    )
    if resp.status_code != 200:
        util.return_error_response(
            f'token_check: GET /api/v1/user/session returned {resp.status_code}'
        )

    # token works; no object changes
    util.return_response({'objects': []})


if __name__ == '__main__':
    main()
