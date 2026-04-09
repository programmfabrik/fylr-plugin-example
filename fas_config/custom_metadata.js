const fs = require('fs');
const path = require('path');

// Get command line arguments
const infoJson = process.argv[2];        // path to info.json
const inputJsonPath = process.argv[3];       // path to request_only_metadata.json
const outputJsonPath = process.argv[4];      // path to example_metadata.json (or whatever output you want)

console.error('Current working directory:', process.cwd());
console.error('Input template:', inputJsonPath);
console.error('Output file:', outputJsonPath);

try {
    // 1. Read and parse info.json
    const info = JSON.parse(infoJson);

    // const tempFileName = `/tmp/info_parsed.json`;
    // fs.writeFileSync(tempFileName, JSON.stringify(info, null, 2), 'utf8');
    // console.error(`📄 Formatted info.json written to: ${tempFileName}`);

    // 2. Get the recipe_configs object and extract the custom values
    const recipeParams = info.recipe_params || {};

    const customDE = recipeParams['custom_de'] ?? '';
    const customEN = recipeParams['custom_en'] ?? '';
    const extra    = recipeParams['extra']     ?? '';

    // 3. Read the template JSON (request_only_metadata.json)
    let template = fs.readFileSync(inputJsonPath, 'utf8');

    // 4. Perform the replacements
    template = template
        .replaceAll('_custom_de_', customDE)
        .replaceAll('_custom_en_', customEN)
        .replaceAll('_extra_',     extra);

    // 5. Write the result to the output file
    fs.writeFileSync(outputJsonPath, template, 'utf8');

    console.error('✅ Successfully wrote custom metadata to:', outputJsonPath);

} catch (err) {
    console.error('❌ Error in custom_metadata.js:', err.message);
    process.exit(1);
}