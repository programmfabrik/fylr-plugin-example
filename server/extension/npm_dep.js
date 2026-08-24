// An extension that depends on an npm package. node_modules never ships, so
// "dayjs" resolves only because the build inlined it into this file (#80732);
// node's own modules stay real requires.
const dayjs = require('dayjs')
const path = require('path')

// %info.json% is passed as the first argument: fylr config + call context,
// including the request's query parameters
const info = JSON.parse(process.argv[2])
const query = (info.request && info.request.query) || {}

// ?date=YYYY-MM-DD, so the response is the caller's date and not the day the
// request happens to be made on
const date = dayjs((query.date || [])[0] || '1970-01-01')

console.log(JSON.stringify({
    module: 'dayjs',
    formatted: date.format('YYYY/MM/DD'),
    // computed by the library, not echoed back
    weekday: date.format('dddd'),
    builtin: path.basename(process.argv[1]),
}))
