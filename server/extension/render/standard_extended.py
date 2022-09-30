import json
from os import path
import sys
import requests
from urllib.parse import urlparse

global access_token
global tags_by_id


def walkDict(data, path):
    if not isinstance(data, dict):
        return None

    pathParts = path.split('.')

    if not pathParts[0] in data:
        return None
    subObj = data[pathParts[0]]

    if len(pathParts) == 1:
        return subObj

    if isinstance(subObj, dict):
        return walkDict(subObj, '.'.join(pathParts[1:]))

    return None


def parseMultilanguage(value, lang, fallback_lang='und'):
    if not isinstance(value, dict):
        return value

    if lang in value and value[lang] != '':
        return value[lang]
    elif fallback_lang in value and value[fallback_lang] != '':
        return value[fallback_lang]

    for l in value:
        if value[l] != '':
            return value[l] + ' [' + l + ']'

    return value


def parseStandard(obj, lang):
    standard = []

    for i in range(3):
        k = '_standard.%d.text' % (i + 1)
        value = walkDict(obj, k)
        if value is None:
            continue

        value = str(parseMultilanguage(value, lang))
        if value == '':
            continue

        standard.append(value.replace('\n', '<br/>'))

    return standard


def parsePath(obj, lang):

    path = walkDict(obj, '_path')
    if not isinstance(path, list) or len(path) < 2:
        return None

    rendered = ''

    for i in range(len(path)):
        s = parseStandard(path[i], lang)
        value = ''
        if len(s) > 0:
            value = s[0]

        rendered += """
            <ul>
                <li>{value}
        """.format(
            value=value
        )

    for i in range(len(path)):
        rendered += """
                </li>
            </ul>
        """

    return rendered


def parseTags(obj, lang):
    global tags_by_id

    rendered = """
        <ul>
    """

    tags = walkDict(obj, '_tags')
    if not isinstance(tags, list) or len(tags) < 1:
        return None

    for tag in tags:
        id = walkDict(tag, '_id')
        if id is None:
            continue
        if id not in tags_by_id:
            continue
        value = parseMultilanguage(tags_by_id[id], lang)
        if value is None:
            continue
        if value == '':
            continue

        rendered += """<li>""" + value + """</li>"""

    rendered += """
        </ul>
    """

    return rendered


def renderValue(label, value, type, suffix='', nested_level=0):

    label = parseMultilanguage(label, lang)

    # if the value is still a dict that has not been parsed, format it
    if isinstance(value, dict):
        try:
            value = '<pre>' + json.dumps(value, indent=4) + '</pre>'
        except Exception as e:
            pass

    return """
            <tr type="{tr_type}">
                <td level="level-{level}">{label}</td>
                <td>{value}</td>
                <td>{type}</td>
            </tr>
    """.format(
        tr_type=type if type == 'system' else 'text',
        level=nested_level,
        label=label + suffix,
        value=value,
        type=type,
    )


def renderAsset(label, asset, suffix='', nested_level=0):

    global access_token

    rendered = ''

    asset_version = 'preview'
    image_url = walkDict(asset, 'versions.' + asset_version + '.url')
    if image_url is None:
        image_url = walkDict(asset, 'versions.' +
                             asset_version + '.download_url')

    if image_url is not None:
        parsed = urlparse(image_url)

        params = parsed.query
        if params != '':
            params += '&'
        params += 'access_token=' + access_token

        image_url = """{prot}://{loc}{path}?{params}""".format(
            prot=parsed.scheme,
            loc=parsed.netloc,
            path=parsed.path,
            params=params
        )

        rendered += renderValue(
            label,
            '<img src="' + image_url + '"/>',
            'file',
            nested_level=nested_level
        )

    technical_metadata = walkDict(asset, 'technical_metadata')
    if isinstance(technical_metadata, dict):
        for tm_label in technical_metadata:
            value = technical_metadata[tm_label]

            if tm_label == 'blurhash_img':
                rendered += renderValue(
                    tm_label,
                    '<img src="' + value + '"/><br/><div class="text">' + value + '</div>',
                    'text',
                    nested_level=nested_level + 1
                )
                continue

            rendered += renderValue(
                tm_label,
                value,
                'text',
                nested_level=nested_level + 1
            )

    return rendered


def renderFieldRow(obj, key, label, lang, type, suffix='', nested_level=0):
    value = walkDict(obj, key)
    if value is None:
        return ''

    if isinstance(value, dict):
        if 'print' in value:
            value = value['print']

    if isinstance(value, dict):
        if '_values' in value:
            rendered = """
                <table class="object">
            """

            for v in value['_values']:
                rendered += renderValueRow(
                    v,
                    lang,
                    suffix=suffix,
                    nested_level=nested_level,
                )

            rendered += """
                </table>
            """
            value = rendered
        else:
            value = parseMultilanguage(value, lang)

    return renderValue(
        label,
        value,
        type,
        suffix=suffix,
        nested_level=nested_level,
    )


def renderSystemFieldRow(obj, key, label, lang, nested_level=0):
    return renderFieldRow(
        obj,
        key,
        label,
        lang,
        'system',
        nested_level=nested_level
    )


def renderNestedTable(label, nested, lang, nested_level=0):
    rendered = ''

    for row_id in range(len(nested)):
        row = nested[row_id]
        rendered += renderValue(
            label,
            '',
            'nested',
            suffix=' ' + str(row_id + 1),
            nested_level=nested_level
        )

        for entry_id in range(len(row)):
            entry = row[entry_id]
            rendered += renderValueRow(
                entry,
                lang,
                suffix=' ' + str(entry_id + 1),
                nested_level=nested_level + 1
            )

    return rendered


def renderReverseNestedTable(label, nested, lang, nested_level=0):

    for row_id in range(len(nested)):

        rendered = renderValue(
            label,
            '',
            'reverse_nested',
            suffix=' ' + str(row_id + 1),
            nested_level=nested_level
        )

        subObj = nested[row_id]

        rendered += render_object(
            subObj,
            lang,
            nested_level=nested_level + 1
        )

    return rendered


def renderValueRow(obj, lang, suffix='', nested_level=0):
    if obj['type'] in ['nested', 'reverse_nested']:
        if not obj['type'] in obj:
            return ''

        nested = obj[obj['type']]
        if not isinstance(nested, list):
            return ''

        if obj['type'] == 'nested':
            return renderNestedTable(
                obj['display_name'],
                nested,
                lang,
                nested_level=nested_level
            )
        return renderReverseNestedTable(
            obj['display_name'],
            nested,
            lang,
            nested_level=nested_level
        )

    if obj['type'] == 'linked_object':
        if not obj['type'] in obj:
            return ''

        subObj = obj[obj['type']]
        if not isinstance(subObj, dict):
            return ''

        value = parseStandard(subObj, lang)

        return renderValue(
            obj['display_name'],
            '<br/>'.join(value),
            'linked_object',
            suffix=suffix,
            nested_level=nested_level
        )

    if obj['type'] == 'file':
        if not obj['type'] in obj:
            return ''

        asset = obj[obj['type']]
        if not isinstance(asset, dict):
            return ''

        return renderAsset(
            obj['display_name'],
            asset,
            suffix=suffix,
            nested_level=nested_level
        )

    return renderFieldRow(
        obj,
        obj['type'],
        obj['display_name'],
        lang,
        obj['type'],
        nested_level=nested_level
    )


def render_object(obj, lang, nested_level=0):

    objecttype = obj['_objecttype']

    rendered = ''

    # system fields
    for f in [
        ('_objecttype_display_name', 'Objecttype'),
        ('_system_object_id', 'System ID'),
        (objecttype + '._pool.pool.name', 'Pool'),
        ('_mask_display_name', 'Mask'),
        ('_system_object_id_parent', 'Parent System ID'),
    ]:
        rendered += renderSystemFieldRow(
            obj,
            f[0],
            f[1],
            lang,
            nested_level=nested_level
        )

    path = parsePath(obj, lang)
    if path is not None:
        rendered += renderValue(
            'Path',
            path,
            'system',
            nested_level=nested_level,
        )

    standard = parseStandard(obj, lang)
    if isinstance(standard, list):
        rendered += renderValue(
            'Standard',
            '<br/>'.join(standard),
            'system',
            nested_level=nested_level,
        )

    tags = parseTags(obj, lang)
    if tags is not None:
        rendered += renderValue(
            'Tags',
            tags,
            'system',
            nested_level=nested_level,
        )

    # object fields (values)
    if '_values' in obj:
        for v in obj['_values']:
            rendered += renderValueRow(
                v,
                lang,
                nested_level=nested_level
            )

    return rendered


if __name__ == '__main__':

    if len(sys.argv) != 2:
        sys.stderr.writelines(['argument info.json missing'])
        exit(1)

    info_json = json.loads(sys.argv[1])

    # get the object id from the request query
    obj_id = walkDict(info_json, 'request.query.id')
    if not isinstance(obj_id, list) or len(obj_id) < 1:
        sys.stderr.writelines(
            ['invalid value for info.json.request.query.id'])
        exit(1)
    obj_id = obj_id[0]

    # get the objecttype from the request query
    objecttype = walkDict(info_json, 'request.query.objecttype')
    if not isinstance(objecttype, list) or len(objecttype) < 1:
        sys.stderr.writelines(
            ['invalid value for info.json.request.query.objecttype'])
        exit(1)
    objecttype = objecttype[0]

    # get the mask token from the request query
    mask = walkDict(info_json, 'request.query.mask')
    if not isinstance(mask, list) or len(mask) < 1:
        mask = '_all_fields'
    else:
        mask = mask[0]

    # get the access token from the request query
    access_token = walkDict(info_json, 'request.query.access_token')
    if not isinstance(access_token, list) or len(access_token) < 1:
        sys.stderr.writelines(
            ['invalid value for info.json.request.query.access_token'])
        exit(1)
    access_token = access_token[0]

    # get the language from the request query
    lang = walkDict(info_json, 'request.query.language')
    if not isinstance(lang, list) or len(lang) < 1:
        lang = 'en-US'
    else:
        lang = lang[0]

    # get the api url
    url = walkDict(info_json, 'api_url')
    if not isinstance(url, str):
        sys.stderr.writelines(
            ['invalid value for info.json.api_url'])
        exit(1)

    # load the object in format standard_extended using the db api

    db_url = """{url}/api/v1/db/{objecttype}/{mask}/{obj_id}""".format(
        url=url,
        objecttype=objecttype,
        mask=mask,
        obj_id=obj_id
    )
    url_params = {
        'format': 'standard_extended',
        'access_token': access_token,
    }

    resp = requests.get(
        url=db_url,
        params=url_params
    )

    if resp.status_code != 200:
        sys.stderr.writelines([
            'call to api/v1/db returned statuscode ' + str(resp.status_code),
            '\n',
            resp.text
        ])
        print(db_url + '?format=' +
              url_params['format'] + '&access_token=' + url_params['access_token'])
        exit(1)

    obj = json.loads(resp.text)
    if not isinstance(obj, list) or len(obj) < 1:
        sys.stderr.writelines([
            'call to api/v1/db returned invalid object list',
            '\n',
            json.dumps(obj, indent=4)
        ])
        print(db_url + '?format=' +
              url_params['format'] + '&access_token=' + url_params['access_token'])
        exit(1)

    # load tags to display them if needed
    tag_url = """{url}/api/v1/tags""".format(
        url=url,
    )
    url_params = {
        'access_token': access_token,
    }

    resp = requests.get(
        url=tag_url,
        params=url_params
    )

    tags_by_id = {}
    if resp.status_code == 200:
        taggroups = json.loads(resp.text)
        if isinstance(taggroups, list):
            for taggroup in taggroups:
                tags = walkDict(taggroup, '_tags')
                if not isinstance(tags, list):
                    continue

                for tag in tags:
                    id = walkDict(tag, 'tag._id')
                    if id is None:
                        continue
                    name = walkDict(tag, 'tag.displayname')
                    if name is None:
                        continue

                    tags_by_id[id] = name

    # generate html that is printed to stdout to be displayed in the browser

    print("""
        <head>
            <link rel="stylesheet" href="/api/v1/plugin/static/base/fylr_example/dump.css"/>
        </head>

        <body>

            <table class="object">
    """)

    print(render_object(obj[0], lang))

    print("""
            </table>
        </body>
    """)
