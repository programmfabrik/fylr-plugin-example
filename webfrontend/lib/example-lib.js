// A vendored plain-JavaScript library — what a webfrontend bundle source that
// is not CoffeeScript is for. The real cases are third-party libraries shipped
// as plain JS (a WebGL viewer, a charting library): they cannot reasonably be
// rewritten in CoffeeScript, and fylr loads only the one bundle named by
// plugin.webfrontend.url, so they have to be part of that bundle.
//
// build.yml lists it FIRST, before the compiled CoffeeScript, so these symbols
// exist while the bundle is still being evaluated — a library that a class body
// calls into has to come first, and the sources are taken in the order written
// (#80732).

ez5.FylrExampleLib = {

	version: "1.0.0",

	// Serialize a flat object into a query string, in insertion order.
	buildQuery: function (params) {
		var query = "";
		for (var name in params) {
			query += name + "=" + params[name] + "&";
		}
		return query;
	}
};
