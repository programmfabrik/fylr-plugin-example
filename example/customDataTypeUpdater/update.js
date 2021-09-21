const fs = require('fs')
const dv = require('./dv.js')

Date.prototype.AddMinutes = function ( minutes ) {
    minutes = minutes ? minutes : 0;
    this.setMinutes( this.getMinutes() + minutes );
    return this;
}

main = (payload) => {
    switch (payload.action) {
        case "start_update":
            outputData({
                "state": {
                    "personal": 2
                },
                "log": ["started logging"]
            })
            break
        case "update":
            for (var i = 0; i < payload.objects.length; i++) {
                payload.objects[i].data.numberfield++
                payload.objects[i].data._expires_at = (new Date()).AddMinutes(2).toISOString()
                // increment version. this is checked by apitest test/api/db/custom_data_type_updater
                payload.objects[i].data.version++
                console.error("data", i, payload.objects[i].data.numberfield)
            }
            outputData({
                "payload": payload.objects,
                "log": [payload.objects.length+" objects in payload"]
            })
            // send data back for update
            break
        case "end_update":
            outputData({
                "state": {
                    "theend": 2,
                    "log": ["done logging"]
                }
            })
            break
        default:
            console.error("i am here 2")
            outputErr("Unsupported action " + payload.action)
    }
}

outputData = (data) => {
    out = {
        "status_code": 200,
        "body": data
    }
    // await dv.send(out)
    process.stdout.write(JSON.stringify(out))
    process.exit(0);
}

outputErr = (err2) => {
    let err = {
        "status_code": 400,
        "body": {
            "error": err2.toString()
        }
    }
    console.error(JSON.stringify(err))
    process.stdout.write(JSON.stringify(err))
    // we exit with 0 as this is a "user space" error and
    // this error is sent back thru a regular body
    process.exit(0);
}

(() => {
    run_main = () => {
        try {
            let payload = JSON.parse(data)
            // dv.send(payload)
            console.error("data has length", data.length)
            console.error(payload)
            main(payload)
        } catch (error) {
            console.error("caught error", error)
            outputErr(error)
        }
    }

    // dv.send(JSON.parse(process.argv[2]))

    let data = ""
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
        let chunk;
        while ((chunk = process.stdin.read()) !== null) {
            data = data + chunk
        }
    });
    process.stdin.on('end', () => {
        run_main()
    });
})();


