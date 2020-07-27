let input = '';
process.stdin.on('data', d => {
    try {
        input += d.toString();
    } catch(e) { 
        console.error(`Could not read input into string: ${e.message}`, e.stack);
        process.exit(1);
    }
});
process.stdin.on('end', () => {
    let data;
    try {
        data = JSON.parse(input);
    } catch(e) {
        console.error(`Could not parse input string into JSON array: ${e.message}`, e.stack);
        process.exit(1);
    }
    data.forEach((d, i) => {
        d.newProp = `Prop#${i}`;
    });
    console.log(JSON.stringify(data));
});
