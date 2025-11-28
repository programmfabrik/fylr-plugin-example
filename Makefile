COFFEE_FILES = \
	webfrontend/FylrExampleCustomDataType.coffee \
	webfrontend/ExampleDetailSidebarPlugin.coffee \
	webfrontend/FylrExampleCustomDatamodelSettings.coffee \
	webfrontend/FylrExampleTransition.coffee \
	webfrontend/FylrExampleExportPluginSleep.coffee

JS = webfrontend/FylrExample.js

PLUGIN_NAME = fylr_example
ZIP_NAME ?= $(PLUGIN_NAME).zip
BUILD_DIR = build

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

all: build ## build all

build: clean code ## build all (creates build folder)
	mkdir -p $(BUILD_DIR)/$(PLUGIN_NAME)
	cp manifest.master.yml $(BUILD_DIR)/$(PLUGIN_NAME)/manifest.yml
	cp -r server l10n fas_config customDataTypeUpdater $(BUILD_DIR)/$(PLUGIN_NAME)
# remove Go stuff
	rm -rf $(BUILD_DIR)/$(PLUGIN_NAME)/server/extension/hello/*
	cp -r server/extension/hello/*.exe $(BUILD_DIR)/$(PLUGIN_NAME)/server/extension/hello

	mkdir -p $(BUILD_DIR)/$(PLUGIN_NAME)/webfrontend
	cp -r $(JS) webfrontend/FylrExample.html webfrontend/*.css $(BUILD_DIR)/$(PLUGIN_NAME)/webfrontend

code: $(JS) go ## build Coffeescript + Go code

go:
	$(MAKE) -C server/extension/hello build

zip: build ## build zip file for publishing
	cd $(BUILD_DIR) && zip $(ZIP_NAME) -r $(PLUGIN_NAME)

clean: ## clean build files
	rm -f $(JS)
	rm -rf $(BUILD_DIR)
	$(MAKE) -C server/extension/hello clean

${JS}: $(subst .coffee,.coffee.js,${COFFEE_FILES})
	mkdir -p $(dir $@)
	cat $^ > $@

%.coffee.js: %.coffee
	coffee -b -p --compile "$^" > "$@" || ( rm -f "$@" ; false )

