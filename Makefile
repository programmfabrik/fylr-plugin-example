COFFEE_FILES = \
	webfrontend/FylrExampleCustomDataType.coffee \
	webfrontend/FylrExampleCustomDatamodelSettings.coffee \
	webfrontend/FylrExampleTransition.coffee

JS = webfrontend/FylrExample.js

PLUGIN_NAME = fylr-plugin-example
ZIP_NAME ?= $(PLUGIN_NAME).zip
BUILD_DIR = build

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: clean code ## build all (creates build folder)
	mkdir -p $(BUILD_DIR)/$(PLUGIN_NAME)
	cp manifest.master.yml $(BUILD_DIR)/$(PLUGIN_NAME)/manifest.yml
	cp -r server l10n fas_config customDataTypeUpdater $(BUILD_DIR)/$(PLUGIN_NAME)
	mkdir -p $(BUILD_DIR)/$(PLUGIN_NAME)/webfrontend
	cp -r $(JS) webfrontend/FylrExample.html webfrontend/FylrExample.css $(BUILD_DIR)/$(PLUGIN_NAME)/webfrontend

code: $(JS) ## build Coffeescript code

zip: build ## build zip file for publishing
	cd $(BUILD_DIR) && zip $(ZIP_NAME) -r $(PLUGIN_NAME)

clean: ## clean build files
	rm -f $(JS)
	rm -rf $(BUILD_DIR)

${JS}: $(subst .coffee,.coffee.js,${COFFEE_FILES})
	mkdir -p $(dir $@)
	cat $^ > $@

%.coffee.js: %.coffee
	coffee -b -p --compile "$^" > "$@" || ( rm -f "$@" ; false )

