(()=> {
    console.log(JSON.stringify(
      {
        "code": "custom.error",
        "err": "custom err", // this used to cause a parser error
        "error": "custom error",
        "statuscode": 402
      }
    ))
    console.error("This error goes to STDERR")
    // pass status code here
    process.exit(499)
})()
