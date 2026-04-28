# encoding: utf-8


import json
import sys
import requests


# plugin response functions

# the direct response from the plugin uses stdin and stderr


def stdout(msg: str):
    sys.stdout.write(msg)
    sys.stdout.write('\n')


def stderr(msg: str):
    sys.stderr.write(msg)
    sys.stderr.write('\n')


def return_response(response: dict):
    stdout(json.dumps(response))
    exit(0)


def return_error_response(error: str):
    stderr(f'error in fylr-plugin-example: {error}')
    return_response(
        {
            'error': {
                'code': 'fylr-plugin-example.error',
                'statuscode': 400,
                'description': error,
                'error': error,
            },
        },
    )


# -----------------------------

# helper functions to parse callback data from fylr

# the api url and access token are necessary if the plugin
# needs to read/write more data over the fylr api


def get_api_url(callback_data):
    url = get_json_value(callback_data, 'info.api_url')
    if not url:
        return_error_response('info.api_url missing!')
    return f'{url}/api/v1'


def get_access_token(callback_data):
    access_token = get_json_value(callback_data, 'info.api_user_access_token')
    if not access_token:
        return_error_response('info.api_user_access_token missing!')
    return access_token


# -----------------------------

# fylr api functions

# the plugin can call the fylr api to read/write more data


def fylr_api_headers(access_token):
    return {'authorization': f'Bearer {access_token}'}


def get_from_api(api_url, path, access_token):
    resp = requests.get(
        url=f'{api_url}/{path}',
        headers=fylr_api_headers(access_token),
    )

    return resp.text, resp.status_code


def post_to_api(api_url, path, access_token, payload=None):
    resp = requests.post(
        url=f'{api_url}/{path}',
        headers=fylr_api_headers(access_token),
        data=payload,
    )

    return resp.text, resp.status_code


# -----------------------------


def get_json_value(js, path, expected=False, split_char='.'):

    current = js
    path_parts = []
    current_part = ''

    for i in range(len(path)):
        if path[i] != split_char:
            current_part += path[i]
            if i == len(path) - 1:
                path_parts.append(current_part)
            continue

        if i > 0 and path[i - 1] == '\\':
            current_part += path[i]
            continue

        if len(current_part) > 0:
            path_parts.append(current_part)
            current_part = ''

    for path_part in path_parts:
        path_part = path_part.replace('\\' + split_char, split_char)

        if not isinstance(current, dict) or path_part not in current:
            if expected:
                raise Exception('expected: ' + path_part)
            else:
                return None

        current = current[path_part]

    return current
