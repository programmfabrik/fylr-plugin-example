// A vendored plain-JavaScript library — what build.yml's "webfrontend.js"
// list is for. The real cases are third-party libraries shipped as plain JS (a
// WebGL viewer, a charting library): they cannot reasonably be rewritten in
// CoffeeScript, and fylr loads only the one bundle named by
// plugin.webfrontend.url, so they have to be part of that bundle.
//
// The js list is appended AFTER the compiled CoffeeScript, so these symbols
// exist by the time the frontend calls into the plugin, but not while the
// bundle itself is evaluated: use them from methods (as
// ExampleDetailSidebarPlugin.coffee does), never at class-body level.

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
