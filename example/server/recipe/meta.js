const fs = require('fs');
let fn = ""
if (process.argv.length === 4) {
    fn = process.argv[3]
} else {
    process.exit(1)
}
fs.writeFileSync(fn, JSON.stringify({
    "Zonk": {
        "Honk": "henk"
    },
    "_technical_metadata": {
        "horst": {
            "gut": "sieht torsten"
        }
    }
}))
console.log("wrote file", fn)
