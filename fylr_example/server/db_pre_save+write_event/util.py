# encoding: utf-8


import json
import sys
import requests


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


def dumpjs(js, indent=4):
    return json.dumps(js, indent=indent)


# plugin response functions


def stdout(line):
    sys.stdout.write(line)
    sys.stdout.write('\n')


def stderr(line):
    sys.stderr.write(line)
    sys.stderr.write('\n')


def return_response(response):
    stdout(dumpjs(response))
    exit(0)


def return_error_response(error):
    stderr(error)
    exit(1)

# fylr api functions


def fylr_api_headers(access_token):
    return {
        'authorization': 'Bearer ' + access_token,
    }


def get_from_api(api_url, path, access_token):

    resp = requests.get(
        api_url + '/' + path,
        headers=fylr_api_headers(access_token))

    return resp.text, resp.status_code


def post_to_api(api_url, path, access_token, payload=None):

    resp = requests.post(
        api_url + '/' + path,
        headers=fylr_api_headers(access_token),
        data=payload)

    return resp.text, resp.status_code
