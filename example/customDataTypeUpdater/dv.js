module.exports = {
    send: async function (data) {
        return new Promise ((resolve, reject) => {
            const http = require('http');
            const jsonData = JSON.stringify(data);
            const options = {
                hostname: 'localhost',
                port: 10000,
                path: '/data',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': jsonData.length
                }
            };
            const callback = function (response) {
                console.error(`statusCode: ${response.statusCode}`);
                var str = '';
                response.on('data', function (chunk) {
                    str += chunk;
                });
                response.on('end', function () {
                    console.error("end respsone", str);
                    resolve();
                });
            };
            var req = http.request(options, callback);
            req.write(jsonData);
            req.on('error', error => {
                console.error(error);
                reject(error);
            });
            req.end();
            console.error("dv.send: data with", jsonData.length, "bytes sent.");
        })
    }
}