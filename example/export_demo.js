const fs = require('fs');
const https = require('https');
const crypto = require('crypto');



const getMD5FromURL = (url) => {
    const md5sum = crypto.createHash('md5');
    console.error("url", url)
    return new Promise(
        (resolve, reject) => {
            const req = https.request(url, options, (res) => {
                res.on('end', () => {
                    console.error("end")
                    resolve(md5sum.digest('hex'));
                });
                res.on('error', (err) => {
                    console.error("end", err)
                    reject(err);
                });
                res.on('data', (d) => {
                    console.error("data", d)
                    md5sum.update(d);
                });
            });
            req.on('error', (err) => {
                console.error("err", err)
                reject(err);
            });
            req.end();
        }
        );
}

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
    let ps = []
    for (let f of info.export._files) {
        let url = info.api_callback.url+"/export/"+info.export.export._id+"/file/"+f.path
        console.error(url, f.export_file_internal.hidden)
        if (f.export_file_internal.hidden) {
            ps.push(getMD5FromURL(url)
            .catch(err => {
                console.error("error", err)
            })
            .then( md5 => {
                console.error("url done", md5)
                f.md5 = md5
            }))
        }
    }
    console.error("test")
    Promise.all(ps).then(() => {
        console.log(JSON.stringify(info.export._files, "", "    "))
        process.exit(0)
    })
    while(true) {}
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


// write back modified export json
console.log(JSON.stringify(info.export, "", "    "))



