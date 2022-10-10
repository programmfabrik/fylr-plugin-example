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
		objData = @_detailSidebar.object.getData()

		render_endpoint = "api/v1/plugin/base/fylr_example/render/standard_extended"

		form = document.createElement("form")
		form.action = render_endpoint
		form.target = "_blank"
		form.method = "GET"

		param_id = document.createElement("input")
		param_id.type = "hidden"
		param_id.name = "system_object_id"
		param_id.value = objData._system_object_id
		form.appendChild(param_id)

		param_objecttype = document.createElement("input")
		param_objecttype.type = "hidden"
		param_objecttype.name = "objecttype"
		param_objecttype.value = objData._objecttype
		form.appendChild(param_objecttype)

		param_mask = document.createElement("input")
		param_mask.type = "hidden"
		param_mask.name = "mask"
		param_mask.value = objData._mask
		form.appendChild(param_mask)

		param_language = document.createElement("input")
		param_language.type = "hidden"
		param_language.name = "language"
		param_language.value = ez5.session.frontend_language
		form.appendChild(param_language)

		param_token = document.createElement("input")
		param_token.type = "hidden"
		param_token.name = "access_token"
		param_token.value = ez5.session.token
		form.appendChild(param_token)

		document.body.appendChild(form)

		@_detailSidebar.mainPane.replace([
			new CUI.Button
				text: "Render object in standard_extended format"
				onClick: =>
					form.submit()
		], "top")
		@


ez5.session_ready =>
	DetailSidebar.plugins.registerPlugin(DetailSidebarRender)
