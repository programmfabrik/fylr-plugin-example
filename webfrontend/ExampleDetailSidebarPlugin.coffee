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


	setButton: (button) ->
		@__button?.destroy()
		@__button = button
		CUI.Events.listen
			type: "click"
			capture: true
			node: button
			call: (ev) =>
				@__openStandardExtended()
				ev.stopPropagation()
		return @

	__openStandardExtended: ->
		objData = @_detailSidebar.object.getData()
		baseUrl = ez5.getAbsoluteURL("api/v1/plugin/base/fylr_example/render/standard_extended?")
		opts =
			system_object_id: objData._system_object_id
			objecttype: objData._objecttype
			mask: objData._mask
			language: ez5.session.frontend_language
			access_token: ez5.session.token

		for optName, optValue of opts
			baseUrl+= "#{optName}=#{optValue}&"

		window.open(baseUrl, '_blank').focus();


ez5.session_ready =>
	DetailSidebar.plugins.registerPlugin(DetailSidebarRender)
