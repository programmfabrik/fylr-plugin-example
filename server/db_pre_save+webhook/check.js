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
        // fs.writeFileSync('/tmp/post-data', input);
        data = JSON.parse(input);
        if (!data.info) {
            data.info = {}
        }
    } catch(e) {
        console.error(`Could not parse input: ${e.message}`, e.stack);
        process.exit(1);
    }

    // check that title in object is set
    var modified = false
    data.objects.forEach((obj, idx) => {
        if (obj[obj._objecttype].name?.trim() === "henk was here") {
            console.log(JSON.stringify({"error":{
                "code": "fylr_example.check.not_allowed",
                "statuscode": 400
            }}))
            console.error(`object.text not set`);
            // it's ok to end with 0 here, as the error is recognized inside the top
            // level "error" property
            process.exit(0);
        }
    })

    console.log(JSON.stringify({"objects": []}));
    console.error("No changes");
    process.exit(0);
    return
});
