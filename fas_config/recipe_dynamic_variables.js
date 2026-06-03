// recipe_dynamic_variables.js — dynamic recipe config for example-recipe-variables.
//
// Invoked as:  node recipe_dynamic_variables.js %info.json%
// %info.json% expands to the callback info (already serialized), so the info
// object is in process.argv[2]. We read the plugin's recipe_test.recipe_variables
// base config table and emit one string recipe parameter per row, keyed on the
// row's "name". A blank/empty name produces a nameless parameter on purpose, to
// exercise the server's empty-parameter handling (drop on load, reject on save).
// See #79654.

const info = JSON.parse(process.argv[2]);

const cfg =
    (((((info || {}).config || {}).plugin || {}).fylr_example || {}).config || {}).recipe_test || {};
const rows = cfg.recipe_variables || [];

const params = {};
for (const row of rows) {
    const name = (row && row.name) || "";
    params[name] = { type: "string" };
}

process.stdout.write(JSON.stringify({ params: params }));
