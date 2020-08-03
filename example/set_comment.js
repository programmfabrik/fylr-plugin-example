var info = JSON.parse(process.argv[2]);

var comment = (info.request && info.request.query && info.request.query.comment) || info.comment

if (comment == undefined) {
    // console.error(JSON.stringify(info,"","    "))
    // Output feeback on STDOUT
    console.log(JSON.stringify(
        {
            status_code: 304
        }
    ))
    process.exit(1);
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
        data = JSON.parse(input);
    } catch(e) {
        console.error(`Could not parse input string into JSON array: ${e.message}`, e.stack);
        process.exit(1);
    }

    data.forEach((d, i) => {
        if (d[d._objecttype]._version === 1) {
            return
        }
        if (d._current) {
            console.error("Adding comment to object", d._uuid, d[d._objecttype]._version, d._current[d._objecttype]._version)
        } else {
            console.error("Adding comment to object", d._uuid, d[d._objecttype]._version)
        }
        // add more info from the config value
        if (info.config.system.plugin_fylr_example_comment.value) {
            comment = comment + " " + info.config.system.plugin_fylr_example_comment.value
        }
        if (d._comment) {
            d._comment = d._comment+" "+comment+" #"+i
        } else {
            d._comment = comment+" #"+i
        }
        // remove the _current
        delete(d._current)
    });

    var myArgs = process.argv.slice(0);
    console.error('myArgs: ', myArgs);

    console.log(JSON.stringify(data));
});
