class FylrExampleCustomDataType extends CustomDataType
	getCustomDataTypeName: ->
		"custom:base.fylr_example.example"

	getCustomDataOptionsInDatamodelInfo: (custom_settings) ->
		console.debug("getCustomDataOptionsInDatamodelInfo", custom_settings)
		if custom_settings.fylr_example_config?.value
			return ["true"]
		else
			return ["false"]

	initData: (data) ->
		if not data[@name()]
			data[@name()] = {}

	renderDetailOutput: (data, top_level_data, opts) ->
		cdata = data[@name()]
		console.debug "renderDetailOutput", cdata, cdata.textfield

		div = CUI.dom.element("DIV")
		CUI.dom.append(div,
			new CUI.Label
				text: cdata.textfield
		)
		CUI.dom.append(div,
			new CUI.Label
				text: cdata.numberfield
		)
		return div

	renderEditorInput: (data, top_level_data, opts) ->
		@initData(data)

		cdata = data[@name()]

		form = new CUI.Form
			data: cdata
			fields: [
				form:
					label: "textfield"
				type: CUI.Input
				name: "textfield"
			,
				form:
					label: "numberfield"
				type: CUI.NumberInput
				name: "numberfield"
			]
			onDataChanged: =>
				CUI.Events.trigger
					node: form
					type: "editor-changed"
		.start()

		schema_settings = @getCustomSchemaSettings()
		mask_settings = @getCustomMaskSettings()

		od = new CUI.ObjectDumper
			header_left: "mask/schema settings"
			do_open: true
			object:
				schema: schema_settings
				mask: mask_settings

		div = CUI.dom.element("DIV")
		CUI.dom.append(div, form)
		CUI.dom.append(div, od)
		return div

	getSaveData: (data, save_data, opts) ->
		cdata = data[@name()] or data._template?[@name()] or {}
		cdata._expires_at = (new Date()).toISOString()
		save_data[@name()] = CUI.util.copyObject(cdata, true)

		console.info("getSaveData", save_data[@name()])
		return

	isSourceForMapping: ->
		return true

CustomDataType.register(FylrExampleCustomDataType)
