(()=> {
    // produce lots of data (so that the headers are flushed out > 4K)
    for (let i=0; i<1000000;i++) {
      console.debug("data stream.... some data, doesn't matter..."+i)
    }
    console.error("This error goes to STDERR")
    // at the end exit with an error, this must abort the connection to the client
    // cause the headers have been sent out already
    process.exit(1)
})()
