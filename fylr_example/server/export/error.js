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

(async() => {

    if (info.plugin_action == "produce?infos.json") {
        process.exit(1)
    }

    info.export._files.push({
        "path": "files/infos.json",
        "format": "application/json",
        "export_file_internal": {
            "path": "files/infos.json",
            "content_type": "application/json; charset=utf-8",
            "plugin_action": "produce?infos.json",
            "info": {
            }
        }
    })

    info.export._state = "done"
    delete(info.export._log)

    // write back modified export json
    console.log(JSON.stringify(info.export, "", "    "))
})();
