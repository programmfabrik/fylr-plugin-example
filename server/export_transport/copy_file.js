/*

This plugin stores the received data in the file

transport.options.file

OR

sends the data to the given

transport.options.url

It returns event info which is stored in EXPORT_TRANSPORT_FINISH
by the FYLR server

*/

const fs = require('fs');
const http = require('http');
const https = require('https');

// Start reading stdin immediately
let stdinInput = '';
let stdinEnded = false;
let stdinResolve = null;

process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => (stdinInput += chunk));
process.stdin.on('end', () => {
    stdinEnded = true;
    if (stdinResolve) stdinResolve();
});

function getStdinData() {
    return new Promise((resolve) => {
        const parseAndResolve = () => {
            if (!stdinInput) {
                resolve(null);
            } else {
                try {
                    resolve(JSON.parse(stdinInput));
                } catch (e) {
                    console.error('Failed to parse stdin JSON:', e.message);
                    resolve(null);
                }
            }
        };

        if (stdinEnded) {
            parseAndResolve();
        } else {
            stdinResolve = parseAndResolve;
        }
    });
}

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

const tOpts = info.transport.options;
console.error("writing/sending data as per transport options", tOpts)
const tLog = [];

const sendDataToURL = async (url, data) => {
    return new Promise(
        (resolve, reject) => {
            const parsedURL = new URL(url);
            const client = parsedURL.protocol === 'https' ? https : http;
            const req = client.request(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                timeout: 60000
            }, (res) => {
                res.on('end', resolve);
                //Interesting, apparently we need to consume the data
                res.on('data', () => {});
                res.on('error', reject);
            });
            req.on('timeout', () => reject(new Error("TIMEOUT")));
            req.on('error', reject);
            req.write(data);
            req.end();
        }
    );
}

(async() => {
    // Read stdin and add it to info
    const stdinData = await getStdinData();
    if (stdinData !== null) {
        info.stdin = stdinData;
    }

    let hasError = false;

    if (tOpts.url) {
        try {
            await sendDataToURL(tOpts.url, JSON.stringify(info));
            tLog.push(`data sent: ${tOpts.url}`)
        } catch (e) {
            tLog.push(`failed to send data to ${tOpts.url}: ${e.message}`)
            hasError = true;
        }
    }
    if (tOpts.file) {
        try {
            fs.writeFileSync(tOpts.file, JSON.stringify(info,"","    "));
            tLog.push(`file written: ${tOpts.file}`)
        } catch (e) {
            tLog.push(`failed to write file ${tOpts.file}: ${e.message}`)
            hasError = true;
        }
    }
    if (tOpts["pw:secret"]) {
        tLog.push(`pw:secret: `+ tOpts["pw:secret"])
    }
    // write back modified export json
    console.log(JSON.stringify({
        "_state": hasError ? "failed" : "done",
        "_transport_log": tLog
    }));
    process.exit(hasError ? 1 : 0);
})();

