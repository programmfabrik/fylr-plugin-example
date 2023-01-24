import json
from os import path
import sys
import requests
from urllib.parse import urlparse
import html

global access_token
global plugin_url


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


def parseStandard(obj, lang, parse_eas=True):
    standard = {}

    for i in range(3):
        k = '_standard.%d.text' % (i + 1)
        value = walkDict(obj, k)
        if value is None:
            continue

        value = str(parseMultilanguage(value, lang))
        if value == '':
            continue

        standard[str(i + 1)] = value

    if not parse_eas:
        return standard

    eas = walkDict(obj, '_standard.eas')
    if eas is None:
        return standard
    for k in eas:
        if not isinstance(eas[k], list):
            continue

        found = False
        for e in eas[k]:
            preferred = walkDict(e, 'preferred')
            if not isinstance(preferred, bool):
                continue
            if not preferred:
                continue

            url = walkDict(e, 'versions.preview.url')
            if url is None:
                continue

            standard['EAS'] = '<img width="100" src="' + formatAssetUrl(url) + '"/>'
            found = True

        if found:
            break

    return standard


def parsePath(obj, lang):

    path = walkDict(obj, '_path')
    if not isinstance(path, list) or len(path) < 2:
        return None

    values = []

    for i in range(len(path)):
        standard = parseStandard(path[i], lang)
        if isinstance(standard, dict):
            # find the first standard key of 1, 2, 3 that has a value
            for k in sorted(standard):
                s = standard[k]
                if k in ['1', '2', '3']:
                    s = html.escape(s)

                if i == len(path) - 1:
                    values.append(s)
                    break
                values.append(formatLinkedObjectHref(
                    path[i],
                    s,
                    lang,
                    '_system_object_id'
                ))
                break

    return ' &#x25B8 '.join(values)


def parseTags(obj, lang):

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

        values = []

        displayname = walkDict(tag, 'displayname')
        if isinstance(displayname, dict):
            values.append(html.escape(parseMultilanguage(displayname, lang)))

        values.append('[%d]' % id)

        rendered += """<li>""" + ' '.join(values) + """</li>"""

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
    elif type in ['text', 'text_loca']:
        try:
            v = html.escape(value)
            value = v
        except:
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


def formatAssetUrl(image_url):

    global access_token

    parsed = urlparse(image_url)

    params = parsed.query
    if params != '':
        params += '&'
    params += 'access_token=' + access_token

    return """{prot}://{loc}{path}?{params}""".format(
        prot=parsed.scheme,
        loc=parsed.netloc,
        path=parsed.path,
        params=params
    )


def renderAsset(label, asset, suffix='', nested_level=0):

    rendered = ''

    image_url = walkDict(asset, 'versions.preview.url')
    if image_url is None:
        image_url = walkDict(asset, 'versions.preview.download_url')

    if image_url is not None:
        rendered += renderValue(
            label,
            '<img width="100" src="' + formatAssetUrl(image_url) + '"/>',
            'file',
            nested_level=nested_level,
            suffix=suffix
        )

    # fixed keys in every asset object
    for c in [
        ('_id', 'ID'),
        ('original_filename', 'Original Filename'),
        ('class_extension', 'Class and Extension'),
    ]:
        if c[0] not in asset:
            continue
        rendered += renderValue(
            c[1],
            asset[c[0]],
            'text',
            nested_level=nested_level + 1
        )

    technical_metadata = walkDict(asset, 'technical_metadata')
    if isinstance(technical_metadata, dict):
        for tm_label in technical_metadata:
            value = technical_metadata[tm_label]

            rendered += renderValue(
                tm_label,
                value,
                'text',
                nested_level=nested_level + 1
            )

    return rendered


def formatLinkedObjectHref(sub_obj, standard, lang, key):
    global access_token
    global plugin_url

    if plugin_url is None:
        return standard

    sys_id = walkDict(sub_obj, key)
    if sys_id is None:
        return standard

    objecttype = walkDict(sub_obj, '_objecttype')
    if objecttype is None:
        return standard

    params = {
        'system_object_id': str(sys_id),
        'objecttype': objecttype,
        'mask': '_all_fields',
        'language': lang,
        'access_token': access_token,
    }
    params_str = '&'.join([
        '{p}={v}'.format(
            p=p,
            v=params[p]
        )
        for p in params
    ])

    return """<a href="{url}?{params}">{standard}</a>""".format(
        url=plugin_url,
        standard=standard,
        params=params_str
    )


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

    if (nested_level > 0 and key == '_system_object_id') or key == '_system_object_id_parent':
        value = formatLinkedObjectHref(obj, value, lang, key)

    # special fields that need html escaping
    if key.endswith('._pool.pool.name'):
        value = html.escape(value)

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
    if len(nested) < 1:
        return ''

    rendered = ''

    for entry_id in range(len(nested)):
        entry = nested[entry_id]

        if len(entry) < 1:
            continue

        # do not render an indented nested table if the table row has only
        single_row = len(entry) == 1
        if not single_row:
            rendered += renderValue(
                label,
                '',
                'nested',
                suffix=' ' + str(entry_id + 1),
                nested_level=nested_level
            )

        for row_id in range(len(entry)):
            row = entry[row_id]
            rendered += renderValueRow(
                row,
                lang,
                suffix=('' if single_row else (' ' + str(row_id + 1))),
                nested_level=nested_level + (0 if single_row else 1)
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

        sub_obj = obj[obj['type']]
        if not isinstance(sub_obj, dict):
            return ''

        value = parseStandard(sub_obj, lang, parse_eas=False)
        if isinstance(value, dict):
            # find the first standard key of 1, 2, 3 that has a value
            for k in sorted(value):
                return renderValue(
                    obj['display_name'],
                    formatLinkedObjectHref(
                        sub_obj,
                        value[k],
                        lang,
                        '_system_object_id'
                    ),
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


def render_object_header(obj, lang):
    standard = parseStandard(obj, lang)
    if '1' in standard:
        return '#{0} - {1}'.format(obj['_system_object_id'], html.escape(standard['1']))

    return '#{0}'.format(obj['_system_object_id'])


def render_object(obj, lang, nested_level=0):

    objecttype = obj['_objecttype']

    rendered = ''

    # system fields
    for f in [
        ('_objecttype_display_name', 'Objecttype'),
        ('_system_object_id', 'System ID'),
        (objecttype + '._version', 'Version'),
        ('_version', 'Version'),
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
    if isinstance(standard, dict):
        # sort by 1, 2, 3
        for k in sorted(standard):
            s = standard[k]
            if k in ['1', '2', '3']:
                s = html.escape(s)

            rendered += renderValue(
                'Standard ' + k,
                s,
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
    system_object_id = walkDict(info_json, 'request.query.system_object_id')
    if not isinstance(system_object_id, list) or len(system_object_id) < 1:
        sys.stderr.writelines(
            ['invalid value for info.json.request.query.system_object_id'])
        exit(1)
    system_object_id = system_object_id[0]

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
    api_url = walkDict(info_json, 'api_url')
    if not isinstance(api_url, str):
        sys.stderr.writelines(
            ['invalid value for info.json.api_url'])
        exit(1)

    # get the plugin url
    pl_url = walkDict(info_json, 'request.url.Path')
    if isinstance(pl_url, str):
        plugin_url = pl_url
    else:
        plugin_url = None

    # load the object in format standard_extended using the db api

    db_url = """{url}/api/v1/db/{objecttype}/{mask}/system_object_id/{system_object_id}""".format(
        url=api_url,
        objecttype=objecttype,
        mask=mask,
        system_object_id=system_object_id
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

    # generate html that is printed to stdout to be displayed in the browser

    print("""
        <head>
            <link rel="stylesheet" href="/api/v1/plugin/static/base/fylr_example/dump.css"/>
            <title>{header}</title>
        </head>
        <body>
            <h1>{header}</h1>
            <table class="object">
    """.format(header=render_object_header(obj[0], lang)))

    print(render_object(obj[0], lang))

    print("""
            </table>
        </body>
    """)
