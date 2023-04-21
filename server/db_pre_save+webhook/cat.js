// cat.js reads json from stdin and bounces it back to stdout
// const fs = require('fs');

let input = ''
process.stdin.on('data', d => {
    try {
        input += d.toString()
    } catch(e) {
        console.error(`Could not read input into string: ${e.message}`, e.stack)
        process.exit(1)
    }
});

process.stdin.on('end', () => {
    let data;
    try {
        data = JSON.parse(input)
        delete(data.info)
    } catch(e) {
        console.error(`Could not parse input: ${e.message}`, e.stack)
        process.exit(1)
    }
    // fs.writeFileSync('/tmp/post-req', JSON.stringify(data));
    console.log(JSON.stringify(data, "", "    "))
})