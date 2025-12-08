class FylrExampleExportPluginSleep extends ExportManagerPlugin
	name: ->
		"fylr_example:sleep"

	nameLocalized: ->
		"Sleep"

	getExportData: ->
		exportData = super()

		exportData.eas_fields = {}
		if not exportData.produce_options
			exportData.produce_options = {}
		exportData.produce_options.seconds = @__data.seconds

		return exportData

	renderForm: ->
		@__data = @__initData()

		form = new CUI.Form
			data: @__data
			class: "ez5-example-export-form"
			fields: [
				type: CUI.NumberInput
				name: "seconds"
				label: "Seconds"
				form:
					label: "Seconds"
					hint: "How long to sleep the export"
			]
		return form.start()

	saveAllowed: ->
		true

	__initData: ->
		data =
			seconds: 10
		return data

ez5.session_ready ->
	ExportManager.registerPlugin(new FylrExampleExportPluginSleep())
