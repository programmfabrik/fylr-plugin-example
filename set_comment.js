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
        fs.writeFileSync('/tmp/post-data2', input);
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
        comment = (data.info.request && data.info.request.query && data.info.request.query.comment) || data.info.comment
    }

    if (comment == undefined) {
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
        if (data.info && data.info.config && data.info.config.system && data.info.config.system.plugin_fylr_example_comment.value) {
            comment = comment + " " + data.info.config.system.plugin_fylr_example_comment.value
        }

        // console.error(JSON.stringify(data.objects,"","    "));

        data.objects.forEach((d, i) => {
            if (d._current) {
                console.error("Adding comment to object", d._uuid, d[d._objecttype]._version, d._current[d._objecttype]._version)
            } else {
                console.error("Adding comment to object", d._uuid, d[d._objecttype]._version)
            }
            if (d._comment) {
                d._comment = d._comment+" "+comment+" #"+i
            } else {
                d._comment = comment+" #"+i
            }
            // remove the _current
            delete(d._current)
            delete(d._path)
        });
        var myArgs = process.argv.slice(0);
        delete(data.info)
        console.log(JSON.stringify(data));
    } catch (ex) {
        console.error(ex)
    }
});

