// token_check: export callback used by the fylr apitests for ticket #79926.
//
// It produces no files. It verifies that the tokens fylr hands the plugin in the
// callback info actually work when the plugin calls back into the API
// server-side (without the browser-id cookie):
//   - info.info.api_user_access_token    (the acting user's token)
//   - info.info.plugin_user_access_token (only when a plugin_user is configured)
// For each token present it GETs /api/v1/user/session. The export is marked
// "done" only if every checked token is accepted (HTTP 200); otherwise it is set
// to "failed" so the apitest can simply assert _state. A 400 means session
// binding rejected the token (the #79926 regression). Pass "require_plugin_user"
// as an extra arg to also fail when no plugin_user token was issued at all.
const http = require('http')
const https = require('https')

function getStatus(urlStr, token) {
    return new Promise((resolve) => {
        let u
        try {
            u = new URL(urlStr)
        } catch (e) {
            resolve('bad-url')
            return
        }
        const lib = u.protocol === 'https:' ? https : http
        const req = lib.request(
            {
                hostname: u.hostname,
                port: u.port,
                path: u.pathname,
                method: 'GET',
                timeout: 30000,
                headers: { Authorization: 'Bearer ' + token },
            },
            (res) => {
                res.on('data', () => {})
                res.on('end', () => resolve(res.statusCode))
            }
        )
        req.on('timeout', () => {
            req.destroy()
            resolve('timeout')
        })
        req.on('error', () => resolve('error'))
        req.end()
    })
}

;(async () => {
    let info
    try {
        info = JSON.parse(process.argv[2])
    } catch (e) {
        console.error('token_check: unable to parse info', e)
        process.exit(1)
    }
    const requirePluginUser = process.argv.indexOf('require_plugin_user') >= 0

    const cbInfo = info.info || {}
    const apiURL = cbInfo.api_url || (info.api_callback && info.api_callback.url)
    const sessionURL = apiURL + '/api/v1/user/session'

    const log = []
    let ok = true

    if (cbInfo.api_user_access_token) {
        const s = await getStatus(sessionURL, cbInfo.api_user_access_token)
        log.push('api_user_access_token: ' + s)
        if (s !== 200) ok = false
    }
    if (cbInfo.plugin_user_access_token) {
        const s = await getStatus(sessionURL, cbInfo.plugin_user_access_token)
        log.push('plugin_user_access_token: ' + s)
        if (s !== 200) ok = false
    } else if (requirePluginUser) {
        log.push('plugin_user_access_token: MISSING')
        ok = false
    }

    info.export._state = ok ? 'done' : 'failed'
    info.export._plugin_log = log
    delete info.export._log

    console.log(JSON.stringify(info.export, '', '  '))
})()
