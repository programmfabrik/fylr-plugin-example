import functools, json, hmac, hashlib, os, re, sys

SECRET = 'Hello, World'

def check_sig(headers, hname, body):
    if not hname in headers:
        return "not present"
    h = headers[hname][0]
    m = re.match('(sha(1|256))=([0-9a-f]+)', h)
    if not m:
        return "invalid header format: " + h

    hhash = hmac.new(
        SECRET.encode('utf-8'),
        body.encode('utf-8'),
        functools.partial(hashlib.new, m.group(1))
        ).hexdigest()

    if hhash != m.group(3):
        return "{} hash in {} does not match ({} != {})".format(m.group(1), hname, m.group(3), hhash)

    return "ok"

try:
    parm = json.loads(sys.argv[1])
    body = sys.stdin.read()

    info = {
        #'env': dict(os.environ),
        #'body': json.loads(body),
        #'argv1': parm,
        'result': {
            'check_sig_sha1': check_sig(parm['request']['header'], 'X-Hub-Signature', body),
            'check_sig_sha256': check_sig(parm['request']['header'], 'X-Hub-Signature-256', body),
        },
    }

    print(json.dumps(info, indent = 2))
except Exception as e:
    print(json.dumps({
        "code": "some.error",
        "err": str(e),
        "params": [],
        "realm": "api",
        "statuscode": 400,
    }))
    sys.exit(1)
