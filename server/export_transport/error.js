// write back modified export json
console.log(JSON.stringify({
    "_state": "failed",
    "_transport_log": [
        "Some error",
        "occured here"
    ]
}));
process.exit(0);

