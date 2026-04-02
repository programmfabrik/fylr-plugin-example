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
        // fs.writeFileSync('/tmp/post-req', JSON.stringify(data));
        delete(data.info)
        for (const obj of data.objects) {
            if (obj.bounce?._version > 1 && obj.bounce?.ref) {
                // add hint about current to "ref"
                obj.bounce.ref += ", old ref: "+obj._current?.bounce.ref
            }
        }
    } catch(e) {
        console.error(`Could not parse input: ${e.message}`, e.stack)
        process.exit(1)
    }
    console.log(JSON.stringify(data, "", "    "))
})