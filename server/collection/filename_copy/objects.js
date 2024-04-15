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
        // fs.writeFileSync('/tmp/post-in', input);
        data = JSON.parse(input);
    } catch(e) {
        console.error(`Could not parse input: ${e.message}`, e.stack);
        process.exit(1);
    }


    data.hotfolder_log = []

    var modified = false
    let col = data?.info?.collection_config?.filename_copy?.filename_target
    if (col) {
        data.objects.forEach((obj, idx) => {
            // set a custom field to the filename of the uploaded file
            obj[obj._objecttype][col] = data?.info?.file?.original_filename || "<no filename>"
            data.hotfolder_log.push({
                "path": "path",
                "file": obj[obj._objecttype][col],
                "filesize": "filesize",
                "status": "done",
                "msg": col+" was set by hotfolder plugin",
                "asset_id": "123",
                "system_object_id": "124"
            })
            modified = true
        })
    }

    if (!modified) {
        console.log(JSON.stringify({"objects": []}));
        console.error("No changes");
        process.exit(0);
        return
    }

    delete(data.info)
    // fs.writeFileSync('/tmp/post-out', JSON.stringify(data,"","    "));
    console.log(JSON.stringify(data));
});
