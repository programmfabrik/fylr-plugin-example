// base_fields_only.js exercises the "base fields only" callback contract
// (fylr #71755). A save with base_fields_only=1 shares the value set of the
// predecessor version, so the callback must not answer with values. fylr
// announces the mode as "base_fields_only" in the callback info and rejects an
// answer that carries values anyway.
//
// The mode of this script is picked with "mode":
//   probe   report the received base_fields_only flag in _comment (storable)
//   field   answer with a field value             (fylr must reject in bfo mode)
//   parent  answer with a parent edge             (fylr must reject in bfo mode)
//   tags    answer with _tags                     (storable, must be accepted)
//   noop    answer "nothing changed"
//
// The script serves both transports: as a transition_db_pre_save callback the
// parameters arrive in the posted info, as a webhook extension they arrive in
// the URL query of info.json (argv).

let info = undefined
if (process.argv.length >= 3) {
    info = JSON.parse(process.argv[2])
}

let input = ''
process.stdin.on('data', d => {
    try {
        input += d.toString()
    } catch (e) {
        console.error(`Could not read input into string: ${e.message}`, e.stack)
        process.exit(1)
    }
})

process.stdin.on('end', () => {
    let data
    try {
        data = JSON.parse(input)
        if (!data.info) {
            data.info = {}
        }
    } catch (e) {
        console.error(`Could not parse input: ${e.message}`, e.stack)
        process.exit(1)
    }

    // webhook: the query of the extension request, transition: the action info.
    // A query value is a LIST (a query parameter can repeat), the action info
    // carries plain values — param() hands back the plain value either way.
    const query = info?.request?.query || data.info.request?.query || {}
    const param = (name, fallback) => {
        let v = query[name]
        if (Array.isArray(v)) {
            v = v[0]
        }
        if (v === undefined) {
            v = data.info[name]
        }
        return v === undefined ? fallback : v
    }
    const mode = param("mode", "noop")

    // fylr sets this only for a base_fields_only save. Both transports receive
    // it in the posted body, so it is always read from there.
    const baseFieldsOnly = data.info.base_fields_only === true

    console.error(`base_fields_only.js mode=${mode} base_fields_only=${baseFieldsOnly}`)

    if (mode === "noop") {
        console.log(JSON.stringify({ "objects": [] }))
        process.exit(0)
    }

    data.objects.forEach((obj, idx) => {
        const ot = obj._objecttype
        switch (mode) {
            case "probe":
                // _comment is stored by a base fields only save, so the test can
                // read the flag the callback was given back out of the record
                obj._comment = `base_fields_only=${baseFieldsOnly}`
                break
            case "field":
                obj[ot][param("field", "title")] =
                    param("value", "set by the callback")
                break
            case "parent":
                // a parent edge is a value row too, so it must be rejected in
                // base fields only mode just like a field
                obj[ot]._id_parent = Number(param("id_parent", 1))
                break
            case "tags":
                obj._tags = [{ "_id": Number(param("tag_id")) }]
                break
            default:
                console.error(`unknown mode ${mode}`)
                process.exit(1)
        }
        // _current is echoed back by fylr, it is not part of the answer
        delete (obj._current)
        delete (obj._path)
    })

    delete (data.info)
    console.log(JSON.stringify(data))
})
