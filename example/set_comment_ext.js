const fs = require('fs');

let info = JSON.parse(process.argv[2])

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
        fs.writeFileSync('/tmp/post-data3', input);
        data = JSON.parse(input);
    } catch(e) {
        console.error(`Could not parse input: ${e.message}`, e.stack);
        process.exit(1);
    }

    var comment = (info.request && info.request.query && info.request.query.comment)
    if (comment == undefined) {
        comment = "comment missing"
    }

    if (comment == undefined) {
        // console.error(JSON.stringify(info,"","    "))
        // Output feeback on STDOUT
        // Send back empty list, indicating that nothing was changed by us
        console.log(
            JSON.stringify({
                status_code: 200,
                headers: {
                    "Content-Type": "application/json"
                },
                body: {
                    "request": data.info.request,
                    "objects": []
                }
            })
        )
        process.exit(0);
        return
    }

    // add more info from the config value
    try {

        data.objects.forEach((d, i) => {
            if (d[d._objecttype]._version === 1) {
                return
            }
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
        });
        var myArgs = process.argv.slice(0);
        console.error('myArgs: ', myArgs);
        console.log(
            JSON.stringify({
                status_code: 200,
                headers: {
                    "Content-Type": "application/json"
                },
                body: {
                    "objects": data.objects
                }
            })
        );
    } catch (ex) {
        console.error(ex)
        process.exit(1)
    }
});

