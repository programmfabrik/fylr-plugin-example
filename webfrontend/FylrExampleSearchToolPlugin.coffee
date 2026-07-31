# Search tool plugin: adds tools to the three dot menu of the main search.
#
# Register the class on SearchMain.toolPlugins (see the bottom of this file). One
# instance is built per search, with the search injected, so a plugin can read the
# current result and the current selection.
#
# getTools() is called every time the menu is rebuilt, so it can return a different
# set of tools depending on the current state. Each entry is a plain object with
# ToolboxTool opts:
#
#	name      mandatory; also the l10n lookup: "tool.<name>|text" and "|icon"
#	text      literal label, if you would rather not go through the CSV
#	sort      "<letter>:<1-99>"; a change of letter draws a divider
#	hidden    Boolean or function, evaluated every time the menu opens
#	disabled  same as hidden
#	run       what the tool does when clicked
#	tools     nested tools, turns the entry into a submenu; works at any depth
#
# Careful: `loading` does NOT take a function, unlike hidden/disabled.
#
# getGroup() gives the tools their own header in the menu instead of putting them
# under "Search". It needs "toolbox.class.<group>" in the l10n CSV.
#
# isAvailable() is checked once per search: return false to switch the whole plugin
# off there. The rest of the context is reachable from the plugin itself:
# getSearch(), getSearchInput(), getSearchManagers(), getSearchManager(cls),
# getCollection(), getSelectedObjects(), getSelectedCount(), getLastData(),
# getResultCount(), plus setQueryLanguageQuery() / addQueryLanguageQuery() to drop
# a query language element into the search input.
class FylrExampleSearchToolPlugin extends ez5.SearchToolPlugin

	getGroup: ->
		"fylr_example"

	getTools: ->
		[
			name: "fylr.example.search.query_language"
			sort: "A:1"
			hidden: => @getResultCount() == 0
			run: =>
				@setQueryLanguageQuery
					string: '_last_modified > "$now-7d"'
					label: $$("fylr.example.search.query_language.label")
					name: ""
		,
			name: "fylr.example.search.selection"
			sort: "A:2"
			hidden: => @getSelectedCount() == 0
			run: =>
				ids = @getSelectedObjects().map (collectionObject) ->
					collectionObject.getGlobalObjectId()

				CUI.alert
					title: $$("fylr.example.search.selection.title")
					text: ids.join("\n")
		,
			name: "fylr.example.search.filters"
			sort: "A:3"
			tools: @__getFilterTools()
		]

	# Built from data, to show that submenus can be generated dynamically.
	# Only system fields here, so the queries work against any datamodel.
	__getFilterTools: ->
		filters = [
			key: "today"
			query: '_last_modified > "$now-1d"'
		,
			key: "created"
			query: '_created > "$now-30d"'
		]

		for filter in filters
			do (filter) =>
				name: "fylr.example.search.filters.#{filter.key}"
				run: =>
					@setQueryLanguageQuery
						string: filter.query
						label: $$("fylr.example.search.filters.#{filter.key}.label")
						name: ""


ez5.session_ready ->
	SearchMain.toolPlugins.registerPlugin(FylrExampleSearchToolPlugin)
