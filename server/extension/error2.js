(()=> {
    console.log(JSON.stringify(
      {
        "code": "custom.error",
        "statuscode": 400
      }
    ))
    console.error("This error goes to STDERR")
    // pass status code here
    process.exit(499)
})()
