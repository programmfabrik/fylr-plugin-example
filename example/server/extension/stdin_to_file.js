// this records the request received and append
// it to a file. filename is in argv[2]

const fs = require('fs');

let fn = process.argv[2]
let info = JSON.parse(process.argv[3])

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
    try {
        fs.writeFileSync(fn, "---------\n");
        fs.appendFileSync(fn, JSON.stringify(info, "", "    "));
        fs.appendFileSync(fn, "\nSTDIN START>>>\n");
        try {
            // output pretty-fied JSON if possible
            fs.appendFileSync(fn, JSON.stringify(JSON.parse(input),"","    "));
        } catch {
            fs.appendFileSync(fn, input);
        }
        fs.appendFileSync(fn, "\n<<<STDIN END\n");
    } catch(e) {
        console.error(`Could not parse input string into JSON array: ${e.message}`, e.stack);
        process.exit(1);
    }
});