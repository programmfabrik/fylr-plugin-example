let body = {}
if (process.argv.length >= 3) {
    body = JSON.parse(process.argv[2])
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
    body.body = input
    if (input.length > 0) {
        try {
            body.body_json_parsed = JSON.parse(input)
        } catch(e) {
            console.error(`Could not parse body: ${e.message}`, e.stack)
            body.body_json_parsed = e.message
        }
    } else {
        body.body_json_parsed = null
    }
    console.log(JSON.stringify(body));
})
