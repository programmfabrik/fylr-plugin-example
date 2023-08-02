const fs = require('fs');


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
    // We get the objects being saved from input
    const objects = JSON.parse(input)?.objects;
    if (!objects || !objects.length > 0) {
        process.exit(1);
    }

    const objecttype = objects[0]["_objecttype"];
    let problemsCount = 0;
    const errors = objects.map(o => {
        let e = [];
        for (const fieldName in o[objecttype]) {
            if (fieldName.startsWith("_")) {
                continue;
            }
            const fieldValue = o[objecttype][fieldName];
            if (fieldValue === null || fieldValue === undefined || fieldValue === "") {
                continue;
            }
            e.push({
                "field": fieldName,
                "message": `This is a dummy error message for ${fieldName} with value ${fieldValue}, we only accept empty values here...`,
                "parameters": {
                    a: "a",
                    b: "b",
                }
            });
            problemsCount++;
        }
        return e;
    });

    if (problemsCount === 0) {
        console.log(JSON.stringify({"objects": []}));
        console.error("Validation ok");
        process.exit(0);
        return
    }

    console.log(JSON.stringify(
        {
            "code": "validation.plugin.error",
            "statuscode": 400,
            "parameters": {
                "problems": errors,
            }
        }
    ));
    console.error("This error goes to STDERR")
    process.exit(400);
});
