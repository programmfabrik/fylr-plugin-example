const fs = require('fs');


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
    // We get the objects being saved from input
    const objects = JSON.parse(input)?.objects;
    if (!objects || !objects.length > 0) {
        process.exit(1);
    }

    const objecttype = objects[0]["_objecttype"];
    let problemsCount = 0;
    const errors = objects.map(o => {
        let e = [];
        for (const fieldName in o[objecttype]) {
            if (fieldName.startsWith("_") && !fieldName.startsWith("_nested") && !fieldName.startsWith("_reverse_nested") ) {
                continue;
            }
            const fieldValue = o[objecttype][fieldName];
            if (fieldValue === null || fieldValue === undefined || fieldValue === "") {
                continue;
            }

            // Demo nested errors only for even indexes
            if (fieldName.startsWith("_nested") && fieldValue.length > 0) {
                let idx = 0;
                fieldValue.forEach(nestedObject => {
                    if (idx % 2 === 0) {
                        for (const nestedFieldName in nestedObject) {
                            const nestedFieldValue = nestedObject[nestedFieldName];
                            if (nestedFieldValue === null) {
                                continue;
                            }

                            const n = nestedFieldName.startsWith("_nested") ? nestedFieldName.substring(fieldName.length + 2) + "[]" : nestedFieldName;
                            const f = fieldName.substring(10 + objecttype.length);

                            e.push({
                                "field": objecttype + "." + f + "[" + idx + "]." + n,
                                "message": `This is a dummy error message for ${nestedFieldName} with value ${nestedFieldValue}, we only accept empty values here...`,
                                "parameters": {
                                    a: "a",
                                    b: "b",
                                }
                            });
                            problemsCount++;
                        }
                    }
                    idx++;
                });

                // For a validation error for the nested table itself we can use <subtable_name>[] as field name
                const newNestedFieldName = fieldName.substring(10 + objecttype.length) + "[]";
                e.push({
                    "field": objecttype + "." + newNestedFieldName,
                    "message": `This is a dummy error message for ${newNestedFieldName} with value ${fieldValue}, we only accept empty values here...`,
                    "parameters": {
                        a: "a",
                        b: "b",
                    }
                });

            } else if (fieldName.startsWith("_reverse_nested") && fieldValue.length > 0) {
                // Reverse nested fields, the reverse nested is like _reverse_nested_<linked_table>:<field_name>
                const reverseTableName = fieldName.split(":")[1];
                const reverseFieldName = fieldName.split(":")[2];
                e.push({
                    "field": reverseTableName + "." + reverseFieldName + "[]",
                    "message": `This is a dummy error message for the reverse nested field ${fieldName}`,
                });
                let idx = 0;
                fieldValue.forEach(nestedReversedObject => {
                    // We iterate the fields of the reverse nested object
                    for (const nestedFieldName in nestedReversedObject) {
                        if (nestedFieldName.startsWith("_")) {
                            continue;
                        }
                        e.push({
                            "field": reverseTableName + "." + reverseFieldName + "[" + idx + "]." + nestedFieldName,
                            "message": `This is a dummy error message for the reverse nested field ${nestedFieldName} in ${reverseFieldName}`,
                        });
                    }
                    idx++;
                });

            } else {
                // Not nested fields
                e.push({
                    "field": objecttype + "." + fieldName,
                    "message": `This is a dummy error message for ${fieldName} with value ${fieldValue}, we only accept empty values here...`,
                    "parameters": {
                        a: "a",
                        b: "b",
                    }
                });
                problemsCount++;
            }
        }
        return e;
    });

    if (problemsCount === 0) {
        console.log(JSON.stringify({"objects": []}));
        console.error("Validation ok");
        process.exit(0);
        return
    }

    console.log(JSON.stringify(
        {
            "code": "validation.plugin.error",
            "error": "Server Validation Error, see editor for details",
            "statuscode": 400,
            "parameters": {
                "problems": errors,
            }
        }
    ));
    console.error("This error goes to STDERR")
    process.exit(400);
});
