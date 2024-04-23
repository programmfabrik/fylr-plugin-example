const fs = require('fs');
const http = require('http');
const https = require('https');

let input = '';
process.stdin.on('data', d => {
    try {
        input += d.toString();
    } catch(e) {
        console.error(`Could not read input into string: ${e.message}`, e.stack);
        process.exit(1);
    }
});

process.stdin.on('end', async () => {
    let data;
    try {
        // fs.writeFileSync('/tmp/post-in', input);
        data = JSON.parse(input);
    } catch(e) {
        console.error(`Could not parse input: ${e.message}`, e.stack);
        process.exit(1);
    }

    let have_token
    if (data.info.api_user_access_token) {
        have_token = "yes"
    } else {
        have_token = "no"
    }

    let config = JSON.parse(await fetchUrl(data.info.api_url+"/api/v1/config?access_token="+data.info.api_user_access_token));
    // fs.writeFileSync('/tmp/config-load', JSON.stringify(config, "", "    "))

    data.upload_log = []

    var modified = false
    let col = data?.info?.collection_config?.filename_copy?.filename_target
    if (col) {
        data.objects.forEach((obj, idx) => {
            // set a custom field to the filename of the uploaded file
            obj[obj._objecttype][col] = data?.info?.file?.original_filename || "<no filename>"
            data.upload_log.push({
                "file": "plugin_"+obj[obj._objecttype][col],
                "filesize": 1234567,
                "status": "done",
                "msg": col+" was set by hotfolder plugin. token: "+have_token+" config.name.internal_name: "+config.system.config.name.internal_name,
                "file_eas_id": 123,
                "system_object_id": 124
            })
            modified = true
        })
    }

    if (!modified) {
        console.log(JSON.stringify({"objects": []}));
        console.error("No changes");
        process.exit(0);
        return
    }

    delete(data.info)
    // fs.writeFileSync('/tmp/post-out', JSON.stringify(data,"","    "));
    console.log(JSON.stringify(data));
});



// Function to perform a GET request and return the body of the response
async function fetchUrl(url) {
  // Choose the right module based on the URL
  const client = url.startsWith('https://') ? https : http;

  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        return reject(new Error('Response status was ' + res.statusCode));
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

