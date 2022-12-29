class DetailSidebarRender extends DetailSidebarPlugin

	prefName: ->
		"example_detail_sidebar_plugin"

	getPane: ->
		"top"

	getButtonLocaKey: ->
		"example.detail.sidebar.plugin.render_object"

	isAvailable: ->
		true

	hideDetail: ->
		@_detailSidebar.mainPane.empty("top")

	showDetail: ->

		#We add a loading label with a spinner.
		@_detailSidebar.mainPane.replace(
			new CUI.Label
				icon: "spinner"
				text: "example.detail.sidebar.plugin.render_object.loading_label"
				size: "big"
				centered: true
		, "top")

		objData = @_detailSidebar.object.getData()
		#We create a XHR to get the server html data.
		xhr = new CUI.XHR
			method: 'GET'
			url: "api/v1/plugin/base/fylr_example/render/standard_extended"
			url_data:
				system_object_id: objData._system_object_id
				objecttype: objData._objecttype
				mask: objData._mask
				language: ez5.session.frontend_language
				access_token: ez5.session.token
			responseType: "text"
		.start()
		.done (response) =>
			#When the XHR is resolved we create a Iframe with the retreived html and append it to the detail.
			iframe = CUI.dom.$element("iframe", "extended-standard-view")
			@_detailSidebar.mainPane.replace([
				iframe
			], "top")
			CUI.dom.setStyle(iframe,
				height: "100%"
			)
			iframe.contentWindow.document.open();
			iframe.contentWindow.document.write(response);
			iframe.contentWindow.document.close();

		return @


ez5.session_ready =>
	DetailSidebar.plugins.registerPlugin(DetailSidebarRender)
