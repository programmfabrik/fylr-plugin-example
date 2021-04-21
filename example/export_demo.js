const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

if (process.argv.length < 3) {
    console.error(`Wrong number of parameters. Usage: "node export_demo.js <info>"`)
    process.exit(1);
}

// info contains:
// {
//   "info": "config info",
//   "export": "export api object",
//   "plugin_action": "<action>" // specifying the action expected by the plugin
// }

let info = undefined
try {
    info = JSON.parse(process.argv[2])
    // console.error("info read", info)
} catch(e) {
    console.error(`Unable to parse argument <info>`, e)
    process.exit(1);
}

console.error(info.api_callback);

if (info.plugin_action == "produce?infos.json") {
    console.log(JSON.stringify(info.export._files, "", "    "))
    process.exit(0);
}

for (let f of info.export._files) {
    console.error(f)
    if (f.export_file_internal.file_id > 0) {
        // do not hide regular download files
    } else {
        // hide all data files
        f.export_file_internal.hidden = true
        console.error("hiding file", f.path)
    }
}

info.export._files.push({
    "path": "files/infos.json",
    "format": "application/json",
    "export_file_internal": {
        "path": "files/infos.json",
        "format": "application/json",
        "plugin_action": "produce?infos.json",
        "info": {
        }
    }
})

// add a new file which our plugin produces / provides
info.export.export._version++

delete(info.export._log)

// console.error(JSON.stringify(info.export, "", "    "))
console.error("files", info.export._files.length, "version", info.export.export._version)

info.export._state = "done"
info.export._plugin_protocol = "Add a protocol here\nWith multilines like\nthis"

// write back modified export json
console.log(JSON.stringify(info.export, "", "    "))
