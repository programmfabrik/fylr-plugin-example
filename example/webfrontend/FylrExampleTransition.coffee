class FylrExampleTransition extends TransitionActionAction
	getListViewColumn: ->
		return
			type: CUI.Output
			text: "Comment"

	getSaveData: ->
		sd =
			type: FylrExampleTransition.getType()
			info:
				comment: "horst"
		return sd

	@getType: ->
		return "fylr_example:set_comment"

	getDisplayName: ->
		return "Comment"

TransitionAction.registerAction(FylrExampleTransition)
