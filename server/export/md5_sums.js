const fs = require('fs');
const https = require('http');
const crypto = require('crypto');

const getMD5FromURL = async (url) => {
    const md5sum = crypto.createHash('md5');
    return new Promise(
        (resolve, reject) => {
            const req = https.request(url, {timeout: 60000},(res) => {
                res.on('end', () => resolve(md5sum.digest('hex')));
                res.on('error', reject);
                res.on('data', (d) => md5sum.update(d));
            });
            req.on('timeout', () => reject(new Error("TIMEOUT")));
            req.on('error', reject);
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

(async() => {

    if (info.plugin_action == "produce?infos.json") {
        for (let i = 0, j = info.export._files.length; i < j; i++) {
            const f = info.export._files[i];
            let url = info.api_callback.url+"/export/"+info.export.export._id+"/file/"+f.path
            if (f.export_file_internal.file_id) {
                try {
                    info.export._files[i].md5 = await getMD5FromURL(url+"?token="+info.api_callback.token)
                    console.error('MD5: ' + info.export._files[i].md5, "FILE: ", info.export._files[i].path);
                } catch (e) {
                    console.error(e);
                }
            }
        }
        console.log(JSON.stringify(info.export._files, "", "    "))
        process.exit(0)
    }
    if (info.plugin_action == "produce?dummy.json") {
        console.log(JSON.stringify({"hello": "world"}, "", "    "))
        process.exit(0)
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
            "content_type": "application/json; charset=utf-8",
            "plugin_action": "produce?infos.json",
            "info": {
            }
        }
    })

    // dummy file that contains a fixed timestamp set by the plugin
    // this is only for apitests
    info.export._files.push({
        "path": "files/dummy.json",
        "format": "application/json",
        "export_file_internal": {
            "path": "files/dummy.json",
            "content_type": "application/json; charset=utf-8",
            "plugin_action": "produce?dummy.json",
            "date_created": "2019-05-27T17:42:34.448Z",
            "info": {
            }
        }
    })

    info.export._state = "done"
    info.export._plugin_log = [
        "Add a protocol here",
        "With multiple entries like this"
    ]
    delete(info.export._log)

    // write back modified export json
    console.log(JSON.stringify(info.export, "", "    "))

})();
