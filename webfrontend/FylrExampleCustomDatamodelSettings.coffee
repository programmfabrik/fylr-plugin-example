class FylrExampleCustomDataModelSettings extends SchemaPlugin
	getCustomSettings: (data) ->
		fields = [
			type: CUI.Input
			name: "fylr_example"
			placeholder: "example"
			form:
				label: "example setting"
			data: data.custom_settings
		]
		return fields

	getCustomSettingsLabel: (data) ->
		return "FYLR example"

	getCustomSettingsDisplay: (data) ->
		if data.custom_settings.fylr_example
			return ["FYLR example"]


Schema.registerPlugin(new FylrExampleCustomDataModelSettings())
