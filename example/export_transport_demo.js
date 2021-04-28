/*

This plugin stores the received data in the file

transport.options.target

It returns event info which is stored in EXPORT_TRANSPORT_FINISH
by the FYLR server

*/

const fs = require('fs');
const https = require('http');
const crypto = require('crypto');

if (process.argv.length < 3) {
    console.error(`Wrong number of parameters. Usage: "node export_transport_demo.js <info>"`)
    process.exit(1);
}

// info contains:
// {
//   "info": "config info",
//   "export": "export api object",
//   "transport": "export transport"
// }

let info = undefined
try {
    info = JSON.parse(process.argv[2])
    console.error("info read", info)
} catch(e) {
    console.error(`Unable to parse argument <info>`, e)
    process.exit(1);
}

console.error("writing file", info.transport.options.target)

fs.writeFileSync(info.transport.options.target, JSON.stringify(info,"","    "));

// write back modified export json
console.log(JSON.stringify({
    "_state": "done",
    "log": [
        "file written: "+info.transport.options.target
    ]
}));
