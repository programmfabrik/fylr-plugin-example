(()=> {
    console.log(`<?xml version="1.0" encoding="UTF-8"?>
    <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN"
      "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1"
         width="120" height="120">
      <rect x="14" y="23" width="200" height="50" fill="lime"
          stroke="black" />
    </svg>`)

    console.error("This error goes to STDERR")
    // pass status code here
    process.exit(50)
})()
