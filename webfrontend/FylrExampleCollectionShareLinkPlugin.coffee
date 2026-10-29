# Collection share link plugin: adds buttons next to "Copy" and "Open" in the
# "Link" column of a collection's sharing tab (and in the row's expert editor).
#
# Register the class on CollectionStorable.shareLinkPlugins (see the bottom of this
# file). One instance is built every time a row's link is rendered, with the row and
# its share link injected; the link already carries the login token for anonymous
# links, and the base url of the permission preset, if it has one.
#
# getButtons() returns CUI.Button opts (or CUI.Button instances). They go into a
# buttonbar group of their own, so they are visually separated from the built-in
# buttons; set `group` on a button to change that. While the link cannot be used
# yet (inactive row, or unsaved changes) the buttons are disabled with the same
# tooltip as the built-in ones.
#
# isAvailable() is checked per row: return false to leave that row alone. The rest
# of the context is reachable from the plugin itself: getUrl(), getWho(),
# getAclItem(), getCollection(), getShareLinkProblem().
class FylrExampleCollectionShareLinkPlugin extends ez5.CollectionShareLinkPlugin

	# Only anonymous links: an external portal has no fylr user to log in with.
	isAvailable: ->
		@getWho() instanceof AclWhoCollection

	# Icon only, like "Copy" and "Open": the l10n CSV has "|icon" and "|tooltip"
	# for this key, no "|text".
	getButtons: ->
		[
			loca_key: "fylr.example.collection.share_link.portal.button"
			onClick: (ev, button) =>
				url = "https://portal.example.com/?fylr_collection=" + encodeURIComponent(@getUrl())
				ez5.copyToClipboard(url)
				Asset.showCopyTooltip(url, button, ev)
				return
		]


ez5.session_ready ->
	CollectionStorable.shareLinkPlugins.registerPlugin(FylrExampleCollectionShareLinkPlugin)
