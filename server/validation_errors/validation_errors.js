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
    console.log(JSON.stringify(
        {
            "code": "validation.plugin.error",
            "statuscode": 400,
            "parameters": {
                "henk": "torsten",
                "a": 4,
                "b": [ 1, 2, 3 ]
            }
        }
    ));
    console.error("This error goes to STDERR")
    process.exit(400);
});
