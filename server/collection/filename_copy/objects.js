const http = require('http');
const https = require('https');

const DEGUG = true;

async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString();
}

async function fetchUrl(url) {
    const client = url.startsWith('https://') ? https : http;

    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Response status was ${res.statusCode}`));
            }

            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks).toString()));
        }).on('error', reject);
    });
}

async function fetchConfig(apiUrl, accessToken) {
    const configUrl = `${apiUrl}/api/v1/config?access_token=${accessToken}`;
    const response = await fetchUrl(configUrl);
    return JSON.parse(response);
}

async function postRequest(url, body, bearerToken) {
    const parsedUrl = new URL(url);
    const client = parsedUrl.protocol === 'https:' ? https : http;

    const postData = JSON.stringify(body);

    const options = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData),
            'Authorization': `Bearer ${bearerToken}`
        }
    };

    return new Promise((resolve, reject) => {
        const req = client.request(options, (res) => {
            if (res.statusCode < 200 || res.statusCode >= 300) {
                return reject(new Error(`Response status was ${res.statusCode}`));
            }

            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                const responseBody = Buffer.concat(chunks).toString();
                try {
                    resolve(JSON.parse(responseBody));
                } catch {
                    resolve(responseBody);
                }
            });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
    });
}

function createObjectCopy(sourceObject) {
    const objectType = sourceObject._objecttype;
    const sourceData = sourceObject[objectType];

    const copiedData = { ...sourceData };
    copiedData._id = null;
    copiedData._version = 1;

    result = {
        [objectType]: copiedData,
        _mask: sourceObject._mask,
        _objecttype: objectType,
    };

    if(sourceObject._tags !== undefined)
    {
        result._tags = sourceObject._tags;
    }

    if(sourceObject._pool !== undefined)
    {
        result._pool = sourceObject._pool;
    }

    return result;
}

async function processObjects(data, config) {
    if (DEGUG) {
        const fs = require('fs');
        const logData = { data, config, timestamp: new Date().toISOString() };
        fs.writeFileSync('/tmp/filename_copy_log.json', JSON.stringify(logData, null, 2));
    }

    const targetColumn = data?.info?.collection_config?.filename_copy?.filename_target;
    if (!targetColumn) {
        return { modified: false, objects: [] };
    }

    const hasToken = data.info.api_user_access_token ? 'yes' : 'no';
    const filename = data?.info?.file?.original_filename || '<no filename>';
    const internalName = config.system.config.name.internal_name;
    const uploadLog = [];

    for (const obj of data.objects) {
        const objectType = obj._objecttype;
        obj[objectType][targetColumn] = filename;

        uploadLog.push({
            file: `plugin_${obj[objectType][targetColumn]}`,
            filesize: 1234567,
            status: 'done',
            msg: `${targetColumn} was set by hotfolder plugin. token: ${hasToken} config.name.internal_name: ${internalName}`,
            file_eas_id: 123,
            system_object_id: 124
        });
    }

    // Create a copy of the first object
    if (data.objects.length > 0) {
        const firstObject = data.objects[0];
        const objectType = firstObject._objecttype;
        const collectionId = data.info.collection.collection._id;
        const apiUrl = data.info.api_url;
        const accessToken = data.info.api_user_access_token;

        const objectCopy = createObjectCopy(firstObject);
        const requestBody = [objectCopy];

        const endpoint = `${apiUrl}/api/v1/db/${objectType}?collection=${collectionId}`;

        // If the setting copy object is true , we make a copy of the first object imported and we add it to the collection
        // This will test that api/db can be used inside a collection_upload plugin.
        if(data?.info?.collection_config?.filename_copy?.copy_object)
        {
            try {
                const response = await postRequest(endpoint, requestBody, accessToken);
                if (DEGUG) {
                    const fs = require('fs');
                    fs.writeFileSync('/tmp/filename_copy_response.json', JSON.stringify(response, null, 2));
                }
            } catch (error) {
                console.error(`Failed to create object copy: ${error.message}`);
            }
        }
    }

    return {
        modified: true,
        objects: data.objects,
        upload_log: uploadLog
    };
}

async function main() {
    try {
        const input = await readStdin();
        const data = JSON.parse(input);

        const config = await fetchConfig(
            data.info.api_url,
            data.info.api_user_access_token
        );

        const result = await processObjects(data, config);

        if (!result.modified) {
            console.log(JSON.stringify({ objects: [] }));
            console.error('No changes');
            process.exit(0);
        }

        const output = {
            objects: result.objects,
            upload_log: result.upload_log
        };

        console.log(JSON.stringify(output));
    } catch (error) {
        console.error(`Error: ${error.message}`, error.stack);
        process.exit(1);
    }
}

main();

