const fs = require('fs');

let info = undefined
if (process.argv.length >= 3) {
    info = JSON.parse(process.argv[2])
}

let input = '';
process.stdin.on('data', d => {
    try {
        input += d.toString();
    } catch(e) {
        console.error(`Could not read input into string: ${e.message}`, e.stack);
        process.exit(1);
    }
});

process.stdin.on('end', () => {
    let data;
    try {
        fs.writeFileSync('/tmp/post-data', input);
        data = JSON.parse(input);
        if (!data.info) {
            data.info = {}
        }
    } catch(e) {
        console.error(`Could not parse input: ${e.message}`, e.stack);
        process.exit(1);
    }

    var comment = undefined
    if (info) {
        // Set from the command line for the extension plugin (webhook)
        comment = (info.request && info.request.query && info.request.query.comment)
    } else {
        // Set directly from the request (like transition/db_pre_save)
        // fs.writeFileSync('/tmp/post-req', JSON.stringify(data.info.request));
        comment = (data.info.request && data.info.request.query && data.info.request.query.comment) || data.info.comment
    }

    // set object.col_a if unset (used in test/api/plugin/not_null)
    var modified = false
    data.objects.forEach((obj, idx) => {
        if (obj._objecttype == "object") {
            var col_a = obj[obj._objecttype].col_a
            if (typeof col_a === "string" && col_a === "") {
                obj[obj._objecttype].col_a = "<empty>" // avoid not null errors
                modified = true
            }
        }
    })

    if (comment == undefined && !modified) {
        // console.error(JSON.stringify(info,"","    "))
        // Output feeback on STDOUT
        // Send back empty list, indicating that nothing was changed by us
        console.log(JSON.stringify({"objects": []}));
        console.error("No changes");
        process.exit(0);
        return
    }

    // add more info from the config value
    try {
        if (data.info && data.info.config && data.info.config.plugin && data.info.config.plugin.fylr_example.config.comment.value) {
            comment = comment + " " + data.info.config.plugin.fylr_example.config.comment.value
        }

        // console.error(JSON.stringify(data.objects,"","    "));

        data.objects.forEach((obj, idx) => {
            if (obj._current) {
                console.error("Adding comment to object", obj._uuid, obj[obj._objecttype]._version, obj._current[obj._objecttype]._version)
            } else {
                console.error("Adding comment to object", obj._uuid, obj[obj._objecttype]._version)
            }
            if (obj._comment) {
                obj._comment = obj._comment+" "+comment+" #"+idx
            } else {
                obj._comment = comment+" #"+idx
            }
            // remove the _current
            delete(obj._current)
            delete(obj._path)
        });
        var myArgs = process.argv.slice(0);
        delete(data.info)
        console.log(JSON.stringify(data));
    } catch (ex) {
        console.error(ex)
    }
});

